import dotenv from 'dotenv';
dotenv.config();

import { run } from "probot";
import app from "./index.js";

run(app); 