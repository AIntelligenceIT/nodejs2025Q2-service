# Etap 1: Budowanie aplikacji
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Kopiuj pliki package.json i package-lock.json (lub yarn.lock)
COPY package*.json ./

# Instaluj zależności produkcyjne
RUN npm install --omit=dev

# Kopiuj resztę kodu aplikacji
COPY . .

# Buduj aplikację
RUN npm run build

# Etap 2: Uruchamianie aplikacji
FROM node:22-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 4000
CMD ["node", "dist/main"]