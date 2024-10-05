#--------- Builder -----------

FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

#--------- Development -----------
FROM builder as development

ENV NODE_ENV=development

CMD ["npm", "run", "start:dev"]


