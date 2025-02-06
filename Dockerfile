FROM node:20-slim
WORKDIR /usr/src/app
COPY package*.json ./
COPY tsconfig.json ./
COPY src/ ./src/
RUN npm ci && npm run build && npm ci --production && npm cache clean --force

# Set build-time environment variables
ENV NODE_ENV="production"
ENV APP_ID="1130707"
ENV LOG_LEVEL="trace"
ENV PORT="8080"

EXPOSE 8080

CMD [ "npm", "start" ]