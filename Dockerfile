FROM node:20-slim
WORKDIR /usr/src/app
# Copy configuration files first
COPY package.json package-lock.json tsconfig.json ./
COPY src/ ./src/
RUN npm ci
RUN npm run build
RUN npm prune --production
RUN npm cache clean --force
ENV NODE_ENV="production"
ENV APP_ID="1130707"
ENV LOG_LEVEL="trace"
ENV PORT="8080"
EXPOSE 8080
COPY . .
CMD [ "npm", "start" ]
