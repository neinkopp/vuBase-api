FROM node:alpine

WORKDIR /usr/src/api

COPY package*.json ./

RUN npm install --only=production
RUN apk add --no-cache ffmpeg=4.3.1-r4

COPY . .

EXPOSE 4000

CMD npx prisma migrate deploy && npx prisma generate && npm run defaultUser && npm run start