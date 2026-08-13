# TaskFlow — Backend

Node.js + Express + TypeScript + Prisma backend for the TaskFlow task board.

Full setup instructions (environment variables, database schema, API endpoints, tests, Docker, etc.) are in the [root README](../README.md).

## Quick start

```bash
npm install
cp .env.example .env       # fill in DATABASE_URL
npx prisma migrate deploy
npx prisma db seed
npm run dev                 # http://localhost:5000
```

Run tests: `npm run test`

Alternatively, run the whole app (backend + frontend) with `docker-compose up --build` from the repo root — see the root README for details.

## Structure

```
src/
├── app.ts             # Express app (exported for tests)
├── lib/prisma.ts      # Prisma client instance
├── routes/            # board.routes.ts, task.routes.ts
└── controllers/        # board.controller.ts, task.controller.ts
prisma/
├── schema.prisma       # data model
├── migrations/         # SQL migration history
└── seed.ts             # sample board/columns/tasks
test/                    # Vitest test suite
```