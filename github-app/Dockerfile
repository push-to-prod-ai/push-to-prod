# Build stage: Install dependencies and build the application
FROM node:20-slim AS builder
WORKDIR /usr/src/app

# Copy configuration files and install all dependencies (including dev dependencies)
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

# Copy the rest of your source code and build TypeScript
COPY src/ ./src/
RUN npm run build

# Production stage: Install only production dependencies and copy over built files
FROM node:20-slim
WORKDIR /usr/src/app

# Copy only the files needed for production
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy the built output from the builder stage (assumes built files are in the "lib" folder)
COPY --from=builder /usr/src/app/lib/ ./lib/

ENV NODE_ENV="production"
ENV PORT="8080"

# Start the server using the compiled JavaScript
CMD [ "npm", "run", "server" ]
