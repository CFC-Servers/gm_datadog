FROM node:20.5

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev && npm install typescript -g

COPY tsconfig.json tsconfig.json

COPY *.ts ./

RUN tsc

CMD [ "node", "dist/index.js" ]
