import { createNodeMiddleware, createProbot } from "probot";
import app from "./index.js";
export const middleware = createNodeMiddleware(app, {
    probot: createProbot(),
    webhooksPath: "/api/github/webhooks",
});
//# sourceMappingURL=middleware.js.map