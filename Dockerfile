FROM node:20-slim
WORKDIR /usr/src/app

# Copy configuration files first
COPY package.json package-lock.json tsconfig.json ./
COPY src/ ./src/

# Install all dependencies (including devDependencies for build)
RUN npm ci

# Build TypeScript
RUN npm run build

# Clean up dev dependencies
RUN npm ci --omit=dev
RUN npm cache clean --force

ENV NODE_ENV="production"
ENV PORT="8080"

# Start the server using the compiled JavaScript
CMD [ "npm", "run", "server" ]
