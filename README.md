# 🎵 Home Library Service

A music library management system to manage users, artists, albums, tracks, and favorites.

## 📦 Prerequisites

- [Git](https://git-scm.com/)
- [Docker](https://www.docker.com/)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/AlanKowalzky/nodejs2025Q2-service.git
cd nodejs2025Q2-service
git checkout develop_part2b
```

### 2. Create `.env` file

```env
PORT=4000
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=twoj_uzytkownik
POSTGRES_PASSWORD=haselko
POSTGRES_DB=twoja_baza_danych
```

### 3. Build & Run the App

```bash
docker compose build
docker compose up
```

- App runs at: [http://localhost:4000](http://localhost:4000)  
- Stop with: `docker compose down`

### Developer mode (hot-reload)

To run the app with hot-reload inside Docker (source mounted and `nest` in watch mode):

```bash
# builds images and starts DB + app in dev mode
docker compose build
docker compose -f docker-compose.yml -f docker-compose.dev.yml up
```

This mode mounts your local source into the container and runs `npm run start:dev` so changes in `src` restart the app automatically.

## ✅ Testing

```bash
npm run test
```

### Migrations

The project includes TypeORM DataSource and migrations in `src/migrations`.

To generate a new migration (after changing entities):

```bash
npm run migration:generate -- -n MigrationName
```

To run migrations:

```bash
npm run migration:run
```

If you run tests locally and the DB is provided by docker-compose, set `POSTGRES_HOST=localhost` or run tests inside the container.

## 📘 API Docs

- Swagger UI: [http://localhost:4000/doc](http://localhost:4000/doc)

## 🧹 Code Quality

```bash
npm run lint     # Check code style
npm run format   # Format code
```

## 🔐 Security

```bash
npm run scan      # Check vulnerabilities
npm run scan:fix  # Fix and update packages
```

## 💡 Features

### Users
- Create, read, update password, delete

### Artists / Albums / Tracks
- Full CRUD operations

### Favorites
- Add/remove tracks, albums, artists

## ⚙️ Implementation

- PostgreSQL for data storage
- UUIDs for all IDs
- Deleted items removed from favorites and references set to `null`
- All API requests/responses in JSON
- Passwords excluded from responses

## 🛠 Stack

- Node.js, NestJS, TypeScript  
- class-validator, Swagger/OpenAPI
