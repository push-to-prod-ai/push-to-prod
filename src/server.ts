import { createProbot } from "probot";
import { createNodeMiddleware } from "@octokit/webhooks";
import http from "http";
import app from "./index.js";

const port = Number(process.env.PORT) || 8080;
const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';

const probot = createProbot();
probot.load(app);

// Create the webhook middleware
const webhookHandler = createNodeMiddleware(probot.webhooks);

// Create an HTTP server that handles health checks on GET "/" 
const server = http.createServer((req, res) => {
  // Health check endpoint used by Cloud Run (or any load balancer)
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { "Content-Type": "text/plain" });
    res.end('healthy');
  } else {
    // Otherwise, let the webhook middleware handle the request
    webhookHandler(req, res);
  }
});

server.listen(port, host, () => {
  console.log(`Server is listening on ${host}:${port}`);
}); 