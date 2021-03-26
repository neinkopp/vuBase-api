FROM node:alpine

WORKDIR /usr/src/api

COPY package*.json .

RUN npm install --only=production
RUN apk add --no-cache ffmpeg=4.2.4-r0

COPY . .

EXPOSE 4000

CMD [ "npm", "run", "start" ]