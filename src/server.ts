import dotenv from 'dotenv';
dotenv.config();

import { run } from "probot";
import app from "./index.js";

// Debug logging for private key (remove in production)
console.log('Private key exists:', !!process.env.PRIVATE_KEY);
console.log('Private key starts with:', process.env.PRIVATE_KEY?.substring(0, 27));

// Ensure private key is properly formatted
if (process.env.PRIVATE_KEY) {
  // Remove any extra quotes and ensure proper line breaks
  process.env.PRIVATE_KEY = process.env.PRIVATE_KEY
    .replace(/\\n/g, '\n')
    .replace(/^"(.*)"$/, '$1');
}

run(app).catch(error => {
  console.error('Failed to start Probot:', error);
  process.exit(1);
}); 