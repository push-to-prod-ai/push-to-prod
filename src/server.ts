import dotenv from 'dotenv';
dotenv.config();

import { run } from "probot";
import app from "./index.js";

run(app).catch(error => {
  console.error('Failed to start Probot:', error);
  process.exit(1);
}); 