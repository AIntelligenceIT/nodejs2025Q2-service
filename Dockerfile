FROM node:22-alpine AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:22-alpine
WORKDIR /usr/src/app

# Kopiuj tylko niezbędne pliki manifestu dla instalacji zależności produkcyjnych
COPY package*.json ./

# Instaluj tylko zależności produkcyjne w czystym środowisku
RUN npm ci --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/main"]