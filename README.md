# TaskFlow

A lightweight task board (Trello-style) — Boards → Columns → Tasks — built as a full-stack take-home assignment.

## Tech stack

- **Backend:** Node.js, Express, TypeScript, Prisma ORM
- **Database:** PostgreSQL (hosted on [Neon](https://neon.tech))
- **Frontend:** React, TypeScript, Vite, Tailwind CSS
- **Testing:** Vitest + Supertest

---

## Project structure

```
taskflow/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma      # data model
│   │   ├── migrations/        # SQL migration history
│   │   └── seed.ts            # sample board/columns/tasks
│   ├── src/
│   │   ├── app.ts             # Express app (exported for tests)
│   │   ├── lib/prisma.ts      # Prisma client instance
│   │   ├── routes/            # board.routes.ts, task.routes.ts
│   │   └── controllers/       # board.controller.ts, task.controller.ts
│   ├── test/                  # Vitest test suite
│   ├── index.ts                # server entrypoint
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/                # axios client + endpoint wrappers
    │   ├── components/         # Board, Column, TaskCard, TaskModal, PriorityFilter
    │   └── types/types.ts      # shared frontend types
    └── .env.example
```

---

## Setup (from a fresh clone)

You'll need a PostgreSQL connection string. The easiest option is a free [Neon](https://neon.tech) project — no local Postgres install needed.

Two ways to run this: **Docker Compose** (fastest) or **manually** (npm install in each folder). Both need the same `.env` files filled in first.

### Option A — Docker Compose

1. Fill in `backend/.env` and `frontend/.env` (see the variable tables below — copy from the `.env.example` files in each folder).
2. From the repo root:

   ```bash
   docker-compose up --build
   ```

3. In a separate terminal, run migrations and seed the database (first run only):

   ```bash
   docker-compose exec backend npx prisma migrate deploy
   docker-compose exec backend npx prisma db seed
   ```

   The seed command prints the created board's id — copy it into `frontend/.env` as `VITE_BOARD_ID`, then restart the frontend container:

   ```bash
   docker-compose restart frontend
   ```

4. Open the app:
   - Backend: `http://localhost:5000`
   - Frontend: `http://localhost:5173`

### Option B — Manual (without Docker)

### 1. Backend

```bash
cd backend
npm install
cp .env.example .env       # fill in DATABASE_URL (see below)
npx prisma migrate deploy  # applies existing migrations
npx prisma db seed         # seeds a demo board with sample tasks
npm run dev                # starts the API on http://localhost:5000
```

The seed script prints the created board's id to the terminal — copy it, you'll need it for the frontend `.env`. If you missed it, run this in the Neon SQL editor (or any Postgres client):

```sql
SELECT id, name FROM "Board";
```

**`backend/.env`**
```
DATABASE_URL=postgresql://<user>:<password>@<host>/<db>?sslmode=require
FRONTEND_URL=http://localhost:5173
PORT=5000
```

Run the backend test suite:

```bash
npm run test
```

### 2. Frontend

In a second terminal:

```bash
cd frontend
npm install
cp .env.example .env       # fill in VITE_BOARD_ID with the id from the seed step above
npm run dev                # starts the app on http://localhost:5173
```

**`frontend/.env`**
```
VITE_API_URL=http://localhost:5000
VITE_BOARD_ID=<the board id printed by the seed script>
```

Open `http://localhost:5173` — you should see the seeded board with three columns (To Do / In Progress / Done) and sample tasks.

---

## Running with Docker — details

The repo includes a `Dockerfile` in both `backend/` and `frontend/`, plus a root `docker-compose.yml`. There's no database container — the app connects to a hosted Neon Postgres instance, so `DATABASE_URL` in `backend/.env` must point to a real, reachable Postgres connection string (Neon free tier works fine).

```
taskflow/
├── docker-compose.yml
├── backend/Dockerfile
└── frontend/Dockerfile
```

Both containers mount the local source as a volume, so code changes on the host are picked up without rebuilding the image — useful if you want to keep developing inside Docker.

Useful commands:

```bash
docker-compose up --build       # build images and start both containers
docker-compose exec backend npx prisma studio   # inspect the database (optional)
docker-compose down             # stop and remove containers
```

If you change `frontend/.env` (e.g. after re-seeding), restart just that container: `docker-compose restart frontend`.

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

Full schema: [`backend/prisma/schema.prisma`](./backend/prisma/schema.prisma). Migration history (equivalent to `schema.sql`) lives in [`backend/prisma/migrations/`](./backend/prisma/migrations/).

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

Both are exercised directly against the database (bypassing the API layer) in `backend/test/board.stat.test.ts`, per the assignment's requirement for a database-layer test.

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

> The backend runs on Render's free tier and is kept warm with an UptimeRobot ping every 5 minutes to avoid cold-start delays.
---

## Frontend features

- **Board view** — columns rendered side by side, each showing its tasks and a live task count.
- **Create / edit / delete task** — via a shared modal component (`TaskModal`), with title required and validated on both the frontend and backend.
- **Move task** — a per-card dropdown to change columns (chosen over drag-and-drop per the assignment's guidance that "a working dropdown beats a broken drag-and-drop").
- **Priority filter** — a dropdown above the board filters visible tasks by priority across all columns.
- **Text search** *(stretch goal)* — a search box filters visible tasks by title, combining with the priority filter.
- **Loading & error states** — the board shows a loading indicator on first load, and a retry button if the fetch fails; individual task actions (create/edit/move/delete) show inline errors without crashing the rest of the UI.

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
- **Priority is optional** on create/edit, defaulting to `MEDIUM` at the database level, per the spec.
- **Priority filtering is case-insensitive** on the backend (`?priority=high` and `?priority=HIGH` both work).
- **Move via dropdown, not drag-and-drop** — per the assignment's explicit guidance to prefer a working control over a broken drag-and-drop given the time budget.
- **Cascade deletes** on Board→Column and Column→Task, since orphaned rows aren't useful in this domain.
- Used Neon (hosted Postgres) instead of SQLite so the same database works locally and once deployed, without a separate provisioning step.

## What I'd improve with more time

- Deploy the backend and frontend to a live host so the project can be opened directly.

## Time spent

Roughly ~1 day: backend + database + tests , frontend , polish and README.

## Something I learned while building this

Using Prisma's `groupBy` instead of fetching all rows and counting them in JavaScript was a good reminder that the database is almost always better at aggregation than the application layer — it's both less code and a real query plan instead of an in-memory loop.
