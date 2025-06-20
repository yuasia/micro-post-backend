FROM node:18-slim

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install

COPY prisma ./prisma
COPY . .

RUN apt-get update && apt-get install -y openssl && npx prisma generate && apt-get install -y curl

EXPOSE 3001

CMD ["npm", "run", "start:dev"]