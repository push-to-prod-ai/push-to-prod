# Build stage: Install dependencies and build the application
FROM node:22-slim AS builder
WORKDIR /usr/src/app

# Copy configuration files and install all dependencies (including dev dependencies)
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

# Copy the rest of your source code and build TypeScript
COPY src/ ./src/
RUN npm run build

# Production stage: Install production dependencies and smee-client
FROM node:22-slim
WORKDIR /usr/src/app

# Copy only the files needed for production
COPY package.json package-lock.json ./
# Install production dependencies and smee-client specifically
RUN npm ci --omit=dev && npm install --no-save smee-client@^2.0.4

# Copy the built output from the builder stage (assumes built files are in the "lib" folder)
COPY --from=builder /usr/src/app/lib/ ./lib/

# Set environment variables
ENV PORT="8080"

# Start the server using npm start to properly initialize Smee client
CMD [ "npm", "start" ]
