FROM node:20.5

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

CMD [ "node", "dist/index.js" ]
