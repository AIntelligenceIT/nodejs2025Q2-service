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
git checkout develop_part2
```

### 2. Create `.env` file

```env
PORT=4000
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_USER=your_user
POSTGRES_PASSWORD=your_password
POSTGRES_DB=your_database
```

### 3. Build & Run the App

```bash
docker compose build
docker compose up
```

- App runs at: [http://localhost:4000](http://localhost:4000)  
- Stop with: `docker compose down`

## ✅ Testing

```bash
npm run test
```

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
