import { createProbot } from "probot";
import { createNodeMiddleware } from "@octokit/webhooks";
import http from "http";
import app from "./index.js";

const port = Number(process.env.PORT) || 8080;
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

const probot = createProbot();
probot.load(app);

// Create middleware and start server
const middleware = createNodeMiddleware(probot.webhooks);
const server = http.createServer(middleware);

// Use the correct overload for listen
server.listen(port, host, () => {
  console.log(`Server is listening on ${host}:${port}`);
}); 