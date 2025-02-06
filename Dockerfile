FROM node:20-slim
WORKDIR /usr/src/app
COPY package.json package-lock.json ./
RUN npm ci --production
RUN npm cache clean --force
ENV NODE_ENV="production"
ENV APP_ID="1130707"
ENV LOG_LEVEL="trace"
ENV PORT="8080"
EXPOSE 8080
COPY . .
CMD [ "npm", "start" ]
