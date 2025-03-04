import winston from 'winston';

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define log level based on environment
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : process.env.LOG_LEVEL || 'info';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

// Add colors to Winston
winston.addColors(colors);

// Define format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info: winston.Logform.TransformableInfo) => `${info.timestamp} ${info.level}: ${info.message}`
  )
);

// Define format for JSON output (for production/logging services)
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.json()
);

// Create transports
const consoleTransport = new winston.transports.Console({
  format: consoleFormat,
});

const fileTransport = new winston.transports.File({
  filename: 'logs/combined.log',
  format: jsonFormat,
  level: 'info',
});

const errorTransport = new winston.transports.File({
  filename: 'logs/error.log',
  format: jsonFormat,
  level: 'error',
});

// Create and export the logger
const logger = winston.createLogger({
  level: level(),
  levels,
  transports: [
    consoleTransport,
    // Only add file transports if not explicitly disabled
    ...(process.env.DISABLE_FILE_LOGGING !== 'true' ? [fileTransport, errorTransport] : []),
  ],
  // Don't exit on error
  exitOnError: false,
});

// Create a stream object for use with HTTP logger middleware (like morgan)
export const stream = {
  write: (message: string) => {
    logger.http(message.trim());
  },
};

// Export the logger as both default and named export for flexibility
export default logger;
export { logger }; 