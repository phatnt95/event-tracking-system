# Baby Tracker Monorepo

> A modern, mobile-first full-stack web application designed for parents to log, organize, and analyze daily baby activities with speed and simplicity.

---

## 📌 Overview

**Baby Tracker** simplifies activity logging for parents and caregivers. Instead of manual notes or cumbersome spreadsheets, parents can log feeding sessions, diaper changes, sleep routines, and growth milestones within a streamlined, unified timeline.

Built on top of an **extensible event engine**, every activity in the application is modeled as an Event. This architecture allows new event types (e.g., medication, growth, sleep) to be integrated seamlessly without major database redesigns.

---

## 🚀 Architecture & Tech Stack

This project is structured as a **pnpm monorepo**:

| Application / Package       | Framework / Tech                                                                                               | Description                                                                             |
| :-------------------------- | :------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------- |
| **`apps/api`**              | [NestJS](https://nestjs.com/), [Prisma ORM](https://www.prisma.io/), [PostgreSQL](https://www.postgresql.org/) | RESTful API server with JWT authentication & event processing engine.                   |
| **`apps/web`**              | [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/)          | Mobile-first web application for fast, single-handed activity logging & timeline views. |
| **`packages/shared-types`** | TypeScript                                                                                                     | Shared DTOs, entity interfaces, and event type definitions across frontend & backend.   |

---

## ✨ Features & Roadmap

### Version 1 (Core MVP)

- 🔐 **User Authentication**: Secure JWT-based login & registration.
- 👶 **Baby Profile Management**: Register and manage baby profiles.
- 🍼 **Feeding Tracker**: Record nursing, bottle feeding (breast milk/formula), and amounts.
- 🧷 **Diaper Tracker**: Record wet/dirty diapers with detailed color/texture notes.
- ⏱️ **Activity Timeline**: Unified reverse-chronological timeline of daily activities.

### Future Roadmap

- 💤 **Sleep & Medication Tracking**: Timer-based sleep tracking and dosage schedules.
- 📈 **Growth & Analytics**: Weight/height percentile charts and daily report dashboards.
- 🔔 **Reminders & Notifications**: Configurable alerts for next feeding or diaper check.
- 🤖 **AI Insights & Family Sharing**: Pattern analysis, PDF exports, and multi-caregiver access.

---

## 🛠️ Prerequisites

Ensure you have the following installed on your local machine:

- **Node.js**: `v18.x` or `v20.x`+
- **pnpm**: `v9.x`+ (`npm install -g pnpm`)
- **PostgreSQL**: Local database instance or via Docker
- **Docker & Docker Compose** _(optional, for containerized execution)_

---

## 📦 Getting Started

### 1. Repository Setup

Clone the repository and install dependencies:

```bash
git clone https://github.com/phatnt95/event-tracking-system.git
cd event-tracking-system
pnpm install
```

### 2. Environment Configuration

Copy the example environment configuration file:

```bash
cp .env.example .env
```

Update `.env` with your PostgreSQL database credentials and JWT secret keys:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL="postgresql://user:password@localhost:5432/baby_tracker?schema=public"
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-key
```

### 3. Database Migration & Prisma Setup

Run database migrations and generate the Prisma Client for `apps/api`:

```bash
# Generate Prisma Client
pnpm --filter api prisma generate

# Apply DB Migrations
pnpm --filter api prisma migrate dev
```

### 4. Running Development Servers

Run both the **NestJS API** (port 3000) and **Next.js Web UI** (port 3001) concurrently:

```bash
pnpm dev
```

Or run services individually:

```bash
# Run NestJS API only
pnpm dev:api

# Run Next.js Web UI only
pnpm dev:web
```

- **API Endpoint**: `http://localhost:3000`
- **Web Interface**: `http://localhost:3001`

---

## 🐳 Docker Deployment

To spin up the entire application stack using Docker Compose:

```bash
# Start all containers in detached mode
docker-compose up -d

# View application logs
docker-compose logs -f
```

---

## 📜 Available Scripts

From the root workspace directory, you can run:

| Command       | Description                                                                   |
| :------------ | :---------------------------------------------------------------------------- |
| `pnpm dev`    | Starts both NestJS API and Next.js Web dev servers concurrently.              |
| `pnpm build`  | Builds all packages (`shared-types`), API (`apps/api`), and Web (`apps/web`). |
| `pnpm lint`   | Runs ESLint across the monorepo.                                              |
| `pnpm format` | Formats code with Prettier (`ts`, `tsx`, `js`, `json`, `md`).                 |

---

## 📚 Project Documentation

For in-depth architecture and design documents, check out the [`docs/`](./docs) directory:

- 📄 [Product Overview](./docs/product/product-overview.md): Product vision, target audience, and success metrics.
- 🏗️ [Event Engine Architecture](./docs/architecture/event-engine.md): Detailed specification of the event-driven system architecture.
- 🎯 [Coding Standards & Best Practices](./skills/AGENTS.md): NestJS & React/TypeScript development guidelines.

---

## 📄 License

Private / Proprietary repository. All rights reserved.
