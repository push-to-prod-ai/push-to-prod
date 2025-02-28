# Use Node.js 22 as the base image
FROM node:22-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm ci

# Copy application code
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080

# Build the application
RUN npm run build

# Expose the port
EXPOSE 8080

# Start the application
CMD ["npm", "start"]