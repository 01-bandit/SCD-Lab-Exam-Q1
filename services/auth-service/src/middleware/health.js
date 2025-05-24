const mongoose = require('mongoose');

const healthCheck = async (req, res) => {
  res.status(200).json({ status: 'OK' });
};

const readinessCheck = async (req, res) => {
  try {
    // Check MongoDB connection
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ status: 'NOT_READY', reason: 'Database not connected' });
    }
    res.status(200).json({ status: 'READY' });
  } catch (error) {
    res.status(503).json({ status: 'NOT_READY', reason: error.message });
  }
};

module.exports = {
  healthCheck,
  readinessCheck
}; 