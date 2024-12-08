const winston = require('winston');
require('winston-papertrail').Papertrail;

const logger = winston.createLogger({
  format: winston.format.simple(),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Only add Papertrail in production
if (process.env.NODE_ENV === 'production' && process.env.PAPERTRAIL_HOST && process.env.PAPERTRAIL_PORT) {
  logger.add(
    new winston.transports.Papertrail({
      host: process.env.PAPERTRAIL_HOST,
      port: process.env.PAPERTRAIL_PORT,
      hostname: 'soul-sanctuary',
      program: 'server',
      colorize: true,
    })
  );
}

// Utility functions for different log levels
const logInfo = (message, meta = {}) => {
  logger.info(message, meta);
};

const logError = (message, error = null) => {
  const meta = error ? { error: error.stack || error.toString() } : {};
  logger.error(message, meta);
};

const logWarning = (message, meta = {}) => {
  logger.warn(message, meta);
};

const logDebug = (message, meta = {}) => {
  logger.debug(message, meta);
};

module.exports = {
  logger,
  logInfo,
  logError,
  logWarning,
  logDebug
};
