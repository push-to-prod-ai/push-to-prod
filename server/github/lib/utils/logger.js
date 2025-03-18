import winston from 'winston';
// Define log levels
const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};
/**
 * Logger class that provides logging functionality using Winston
 */
export class Logger {
    logger;
    constructor() {
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
        const consoleFormat = winston.format.combine(winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }), winston.format.colorize({ all: true }), winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`));
        // Define format for JSON output (for production/logging services)
        const jsonFormat = winston.format.combine(winston.format.timestamp(), winston.format.json());
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
        // Create the logger
        this.logger = winston.createLogger({
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
    }
    /**
     * Log an error message
     * @param message The message to log
     * @param meta Optional metadata
     */
    error(message, meta) {
        this.logger.error(message, meta);
    }
    /**
     * Log a warning message
     * @param message The message to log
     * @param meta Optional metadata
     */
    warn(message, meta) {
        this.logger.warn(message, meta);
    }
    /**
     * Log an info message
     * @param message The message to log
     * @param meta Optional metadata
     */
    info(message, meta) {
        this.logger.info(message, meta);
    }
    /**
     * Log an HTTP message
     * @param message The message to log
     * @param meta Optional metadata
     */
    http(message, meta) {
        this.logger.http(message, meta);
    }
    /**
     * Log a debug message
     * @param message The message to log
     * @param meta Optional metadata
     */
    debug(message, meta) {
        this.logger.debug(message, meta);
    }
    /**
     * Create a stream object for use with HTTP logger middleware (like morgan)
     */
    getStream() {
        return {
            write: (message) => {
                this.http(message.trim());
            },
        };
    }
}
// For backwards compatibility with existing code
export default new Logger();
//# sourceMappingURL=logger.js.map