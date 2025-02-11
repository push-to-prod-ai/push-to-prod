import dotenv from 'dotenv';
dotenv.config();

import { initializeApp } from 'firebase-admin/app';
import { run } from "probot";
import app from "./index.js";

// Initialize Firebase before running the app
initializeApp();

run(app); 