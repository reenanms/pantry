# 🗄️ Pantry

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-22+-green.svg)](https://nodejs.org/)
[![Fastify](https://img.shields.io/badge/Fastify-5.0+-black.svg)](https://www.fastify.io/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)

**Pantry** is a lightweight, zero-config **Backend-as-a-Service (BaaS)** designed specifically for frontend developers. Stop wasting time building mock servers; simply send a request and Pantry auto-provisions everything for you.

---

## ✨ Features

- 🚀 **Auto-Provisioning**: Send a `POST` to any path and Pantry creates the endpoint and schema on the fly.
- 💾 **Persistent Mocking**: Built on SQLite, so your mock data survives restarts.
- ⏱️ **Network Simulation**: Configure artificial latency per route to test loading states and race conditions.
- 🛑 **Static Overrides**: Force specific HTTP status codes (404, 500, 403) and payloads for error-path testing.
- 📊 **Admin Dashboard**: A sleek, dark-themed UI to manage routes, browse data, and monitor request logs.
- 🐳 **Docker Ready**: Single-image deployment for your whole team.

---

## 🚀 Quick Start

### Running with Docker (Recommended)

The easiest way to get started is using Docker Compose:

```bash
docker compose up -d
```
Access the **Admin UI** at `http://localhost:6151` and the **API** at `http://localhost:6150`.

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/youruser/pantry.git
cd pantry

# Start the API
cd api && npm install && npm run dev

# Start the Web Admin (New Terminal)
cd web && npm install && npm run dev
```

---

## 🛠️ How It Works

### 1. Just send data
Pantry listens to all `/api/*` paths. If you hit an undefined route with a `POST`, it creates it immediately.

```bash
curl -X POST http://localhost:6150/api/projects \
  -d '{"title": "Pantry", "status": "active"}'
```

### 2. Manage via Admin
Open `http://localhost:6151` to:
- See your new `/api/projects` route.
- Add a **500ms delay** to test your spinners.
- Switch the route to **Static Mode** to simulate a "503 Service Unavailable" error.

---

## ⚙️ Configuration

Copy `.env.example` to `.env` to customize ports and database location.

| Variable | Default | Description |
|---|---|---|
| `PORT` | `6150` | Primary API port |
| `DB_PATH` | `./data/pantry.db` | SQLite storage path |
| `ADMIN_PORT` | `6151` | Admin UI development port |

---

## 🏗️ Tech Stack

- **Backend**: [Fastify](https://www.fastify.io/) (Performance), [Drizzle ORM](https://orm.drizzle.team/) (Type-safe), [SQLite](https://www.sqlite.org/) (Zero-config).
- **Frontend**: [React](https://react.dev/), [Vite](https://vitejs.dev/), [Vanilla CSS](https://developer.mozilla.org/en-US/docs/Web/CSS) (Custom Design System).
- **Infrastructure**: [Docker](https://www.docker.com/) (Multi-stage builds).

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or PRs to improve the simulation capabilities or the Admin UI.

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
