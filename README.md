# 🗄️ Pantry

**Pantry** is a lightweight, self-provisioning Backend-as-a-Service designed for frontend testing. Create dynamic API endpoints on the fly by simply sending a `POST` request, with a dedicated Admin UI to simulate real-world network conditions.

---

## Quick Start

### Development

```bash
# 1. Start the API
cd api
npm install
npm run dev          # http://localhost:6150

# 2. Start the Admin UI (in another terminal)
cd web
npm install
npm run dev          # http://localhost:6151
```

### Docker

```bash
docker compose up -d    # http://localhost:6150
```

---

## How It Works

1. **POST** to any path under `/api/*` — Pantry auto-provisions the route and stores the data.
2. **GET, PUT, DELETE** on the same path to manage resources.
3. Use the **Admin UI** at `/admin/` to configure latency, static responses, and browse data.

```bash
# Auto-provision a "users" endpoint
curl -X POST http://localhost:6150/api/users \
  -H "Content-Type: application/json" \
  -d '{"name": "Alice", "email": "alice@test.com"}'

# List all users
curl http://localhost:6150/api/users
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `6150` | API server port |
| `HOST` | `0.0.0.0` | API server bind address |
| `DB_PATH` | `./data/pantry.db` | SQLite database file path |
| `API_PORT` | `6150` | API port (used by Admin UI proxy) |
| `ADMIN_PORT` | `6151` | Admin UI dev server port |

Copy `.env.example` to `.env` and customize as needed.

---

## Project Structure

```
pantry/
├── api/          # Backend (Fastify + Drizzle + SQLite)
│   ├── src/      # Source code
│   ├── tst/      # Tests
│   └── scripts/  # Automation scripts
├── web/          # Admin UI (React + Vite)
│   ├── src/      # Source code
│   ├── tst/      # Tests
│   └── scripts/  # Automation scripts
└── docs/         # Documentation
```

---

## Tech Stack

- **Backend:** Fastify, Drizzle ORM, SQLite, TypeScript
- **Frontend:** React, Vite, Vanilla CSS
- **Containerization:** Docker

---

## Testing

```bash
cd api
npm test
```

---

## License

See [LICENSE](./LICENSE).
