/**
 * Logger class that provides logging functionality using Winston
 */
export declare class Logger {
    private logger;
    constructor();
    /**
     * Log an error message
     * @param message The message to log
     * @param meta Optional metadata
     */
    error(message: string, meta?: any): void;
    /**
     * Log a warning message
     * @param message The message to log
     * @param meta Optional metadata
     */
    warn(message: string, meta?: any): void;
    /**
     * Log an info message
     * @param message The message to log
     * @param meta Optional metadata
     */
    info(message: string, meta?: any): void;
    /**
     * Log an HTTP message
     * @param message The message to log
     * @param meta Optional metadata
     */
    http(message: string, meta?: any): void;
    /**
     * Log a debug message
     * @param message The message to log
     * @param meta Optional metadata
     */
    debug(message: string, meta?: any): void;
    /**
     * Create a stream object for use with HTTP logger middleware (like morgan)
     */
    getStream(): {
        write: (message: string) => void;
    };
}
declare const _default: Logger;
export default _default;
