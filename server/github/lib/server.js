import dotenv from 'dotenv';
dotenv.config();
import { run } from "probot";
import app from "./index.js";
import { Logger } from './utils/logger.js';
// Initialize logger
const logger = new Logger();
logger.info('Starting GitHub App server');
run(app);
//# sourceMappingURL=server.js.map