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

# Create directory for the .env file mount
RUN mkdir -p /usr/src/app && chmod 777 /usr/src/app

# Document the port
EXPOSE 8080

CMD [ "npm", "start" ]