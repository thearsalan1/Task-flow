# TaskFlow

A lightweight task board (Trello-style) with Boards → Columns → Tasks, built as a full-stack take-home assignment.

## Tech stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL (hosted on [Neon](https://neon.tech))
- **Frontend:** React, TypeScript, Vite *(added in Phase 2)*
- **Testing:** Vitest + Supertest

---

## Project structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # data model + migrations
│   │   └── seed.ts            # sample board/columns/tasks
│   ├── src/
│   │   ├── app.ts             # Express app (exported for tests)
│   │   ├── lib/prisma.ts      # Prisma client instance
│   │   ├── routes/            # board.routes.ts, task.routes.ts
│   │   ├── controllers/       # board.controller.ts, task.controller.ts
│   │   └── types/types.ts     # shared request/response types
│   ├── test/                  # Vitest test suite
│   ├── index.ts                # server entrypoint (app.listen)
│   └── .env.example
└── frontend/                   # (Phase 2)
```

---

## Backend setup (from a fresh clone)

```bash
cd backend
npm install
cp .env.example .env       # fill in DATABASE_URL (see below)
npx prisma migrate deploy  # applies existing migrations
npx prisma db seed         # seeds a demo board with sample tasks
npm run dev                # starts the server on http://localhost:5000
```

Run the test suite:

```bash
npm run test
```

### Environment variables (`.env`)

```
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
FRONTEND_URL=http://localhost:5173
PORT=5000
```

We're using a hosted Neon Postgres database, so no local database installation is required — just point `DATABASE_URL` at a Postgres instance (Neon free tier or any Postgres works).

---

## Data model

```
Board (1) ──< Column (many) ──< Task (many)
```

| Table    | Key fields |
|----------|-----------|
| `Board`  | `id` (PK), `name`, `createdAt` |
| `Column` | `id` (PK), `name`, `order`, `boardId` (FK → Board) |
| `Task`   | `id` (PK), `title` (NOT NULL), `description` (nullable), `priority` (enum: LOW / MEDIUM / HIGH), `columnId` (FK → Column), `createdAt` |

Full schema: [`prisma/schema.prisma`](./prisma/schema.prisma). Migration history (equivalent to `schema.sql`) lives in `prisma/migrations/`.

Foreign keys use `onDelete: Cascade` — deleting a Board removes its Columns, and deleting a Column removes its Tasks. `title` is enforced NOT NULL at the database level in addition to API-level validation.

---

## The two required non-trivial queries

**1. Task count per column on a board** (`GET /boards/:id/stats`) — uses `groupBy`, not fetch-then-filter:

```ts
const stats = await prisma.task.groupBy({
  by: ["columnId"],
  where: { column: { boardId: id } },
  _count: { id: true },
});
```

**2. Tasks by priority, newest first** (`GET /tasks?priority=HIGH`):

```ts
const tasks = await prisma.task.findMany({
  where: { priority: normalizedPriority },
  orderBy: { createdAt: "desc" },
});
```

Both are exercised directly (bypassing the API layer) in `test/board.stat.test.ts`, per the assignment's requirement for a database-layer test.

---

## API endpoints

| Method | Route | Description |
|---|---|---|
| GET | `/boards/:id` | Board with nested columns + tasks |
| GET | `/boards/:id/stats` | Task count per column |
| GET | `/tasks?priority=HIGH` | Tasks filtered by priority, newest first (priority optional) |
| POST | `/tasks` | Create a task (title required, priority optional) |
| PATCH | `/tasks/:id` | Edit a task (title, description, priority) |
| PATCH | `/tasks/:id/move` | Move a task to another column |
| DELETE | `/tasks/:id` | Delete a task |

All error responses follow `{ success: false, message: string }`. Not-found errors return `404` (mapped from Prisma's `P2025` error code); validation failures return `400`; unexpected errors return `500` with no leaked stack traces.

---

## Tests

Three backend tests, matching the assignment's minimum requirements:

1. **`test/task.create.test.ts`** — creating a task with an empty title is rejected (400); a valid task is created successfully (201). Confirms title validation is enforced server-side, not just in the UI.
2. **`test/task.move.test.ts`** — moving a task to a different column updates `columnId`, verified both in the API response and by re-querying the database directly.
3. **`test/board.stat.test.ts`** — hits the database layer directly, running the `groupBy` stats query against known seed data and asserting the counts are correct.

Tests use an isolated board/columns created in `beforeAll` and cleaned up in `afterAll`, so they don't touch the seeded demo data and can be run repeatedly.

---

## Assumptions & decisions

- **No Board/Column creation endpoints.** The assignment's core features are scoped to Task CRUD + move; boards and columns are provisioned via the seed script (one board, three fixed columns: To Do / In Progress / Done). This keeps the app single-board, matching the assignment's scope.
- **Priority is optional** on create/edit, defaulting to `MEDIUM` at the database level, per the spec ("priority optional").
- **Priority filtering is case-insensitive** (`?priority=high` and `?priority=HIGH` both work) since query strings are easy to get wrong on the frontend.
- **Cascade deletes** on Board→Column and Column→Task, since orphaned rows aren't useful in this domain.
- Used Neon (hosted Postgres) instead of SQLite so the same database works locally and once deployed, without a separate provisioning step.

*(Time spent / interesting thing learned — to fill in after frontend is done.)*