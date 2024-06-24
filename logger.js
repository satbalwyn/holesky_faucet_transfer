// logger.js

const winston = require('winston');
const { format } = winston;
const path = require('path');

// Define log format
const logFormat = format.printf(({ level, message, timestamp, ...metadata }) => {
  let msg = `${timestamp} [${level}] : ${message} `;
  if (Object.keys(metadata).length > 0) {
    msg += JSON.stringify(metadata);
  }
  return msg;
});

// Create logger instance
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: format.combine(
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    format.metadata({ fillExcept: ['message', 'level', 'timestamp'] })
  ),
  transports: [
    // Console transport
    new winston.transports.Console({
      format: format.combine(
        format.colorize(),
        logFormat
      )
    }),
    // File transport for errors
    new winston.transports.File({
      filename: path.join(__dirname, 'logs', 'error.log'),
      level: 'error',
      format: logFormat
    }),
    // File transport for all logs
    new winston.transports.File({
      filename: path.join(__dirname, 'logs', 'combined.log'),
      format: logFormat
    })
  ]
});

// If we're not in production, log to console as well
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: format.combine(
      format.colorize(),
      logFormat
    )
  }));
}

module.exports = logger;