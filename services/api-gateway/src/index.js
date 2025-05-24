require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use(limiter);

app.use(express.json());

// Proxy configuration
const authServiceProxy = createProxyMiddleware({
  target: process.env.AUTH_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  logLevel: 'debug'
});

const blogServiceProxy = createProxyMiddleware({
  target: process.env.BLOG_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/blogs': '/api/blogs'
  },
  logLevel: 'debug'
});

const commentServiceProxy = createProxyMiddleware({
  target: process.env.COMMENT_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/comments': '/api/comments'
  },
  logLevel: 'debug'
});

const profileServiceProxy = createProxyMiddleware({
  target: process.env.PROFILE_SERVICE_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/profile': '/api/profile'
  },
  logLevel: 'debug'
});

// Routes
app.use('/api/auth', authServiceProxy);
app.use('/api/blogs', blogServiceProxy);
app.use('/api/comments', commentServiceProxy);
app.use('/api/profile', profileServiceProxy);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// Readiness check endpoint
app.get('/ready', (req, res) => {
  // Check if all services are up
  const services = [
    process.env.AUTH_SERVICE_URL,
    process.env.BLOG_SERVICE_URL,
    process.env.COMMENT_SERVICE_URL,
    process.env.PROFILE_SERVICE_URL
  ];

  const allServicesUp = services.every(service => {
    try {
      // In a real implementation, you would make HTTP requests to each service
      // and check their health endpoints
      return true;
    } catch (error) {
      return false;
    }
  });

  if (allServicesUp) {
    res.status(200).json({ status: 'READY' });
  } else {
    res.status(503).json({ status: 'NOT_READY' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
}); 