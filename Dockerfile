# Build stage
FROM node:20-slim AS builder
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm ci
RUN npm run build

# Production stage
FROM node:20-slim
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci --production
RUN npm cache clean --force

# Set environment variables
ENV NODE_ENV="production"

# Copy built files from builder stage
COPY --from=builder /usr/src/app/lib/ ./lib/

# Document the port
EXPOSE 8080

# Start the app with the correct port
CMD [ "npm", "start", "--", "--port", "8080" ]