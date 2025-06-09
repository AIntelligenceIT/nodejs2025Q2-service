# Etap 1: Budowanie aplikacji
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Kopiuj pliki package.json i package-lock.json (lub yarn.lock)
# Aby skorzystać z cache'owania warstw Docker, kopiujemy najpierw pliki manifestu
COPY package*.json ./

# Instaluj wszystkie zależności (w tym devDependencies potrzebne do budowania)
# Użyj 'npm ci' dla szybszych, bardziej niezawodnych buildów, jeśli masz package-lock.json i jest on commitowany.
# W przeciwnym razie użyj 'npm install'.
RUN npm ci
# Jeśli nie używasz package-lock.json, alternatywnie:
# RUN npm install

# Kopiuj resztę kodu aplikacji
COPY . .
# Jeśli masz pliki .env specyficzne dla budowania (np. .env.build), skopiuj je tutaj

# Buduj aplik
RUN npm run build

# Etap 2: Uruchamianie aplikacji
FROM node:22-alpine
WORKDIR /usr/src/app

# Kopiuj tylko niezbędne pliki manifestu dla instalacji zależności produkcyjnych
COPY package*.json ./

# Instaluj tylko zależności produkcyjne w czystym środowisku
RUN npm ci --omit=dev

# Kopiuj zbudowaną aplikację z etapu 'builder'
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 4000
CMD ["node", "dist/main"]