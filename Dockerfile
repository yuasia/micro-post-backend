FROM node:18-slim AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY prisma ./prisma
RUN npx prisma generate

COPY . .

RUN npm run builder

FROM node:18-slim
WORKDIR /usr/src/app

COPY package*.json ./
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 3001

CMD ["bash", "-c", "npx prisma migrate deploy && npm run start:prod"]