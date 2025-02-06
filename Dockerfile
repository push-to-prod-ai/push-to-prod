FROM node:20-slim
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/

# Install dependencies, build, and clean up
RUN npm ci && \
    npm run build && \
    npm ci --production && \
    npm cache clean --force

# Copy the built files to where npm start expects them
RUN mkdir -p lib && \
    cp -r dist/* lib/ 2>/dev/null || cp -r build/* lib/ 2>/dev/null || true

# Set environment variables
ENV NODE_ENV="production"
ENV APP_ID="1130707"
ENV LOG_LEVEL="trace"
ENV PORT="8080"

EXPOSE 8080

# For debugging, list the contents of the directory
RUN ls -la && ls -la lib/

CMD [ "npm", "start" ]