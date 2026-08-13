# TaskFlow — Frontend

React + TypeScript + Vite + Tailwind CSS frontend for the TaskFlow task board.

Full setup instructions (backend + frontend, environment variables, data model, Docker, etc.) are in the [root README](../README.md).

## Quick start

```bash
npm install
cp .env.example .env    # fill in VITE_API_URL and VITE_BOARD_ID
npm run dev
```

Requires the backend to be running (see root README) and a seeded board id in `.env`.

Alternatively, run the whole app (backend + frontend) with `docker-compose up --build` from the repo root — see the root README for details.

## Structure

```
src/
├── api/            # axios client + endpoint wrapper functions
├── components/
│   ├── Board.tsx        # fetches/renders the board; loading & error states; priority filter and search box
│   ├── Column.tsx        # renders one column, its tasks, and "add task"
│   ├── TaskCard.tsx       # a single task: edit, delete, move via dropdown
│   ├── TaskModal.tsx      # shared create/edit form
│   └── PriorityFilter.tsx # dropdown to filter visible tasks by priority
└── types/types.ts   # shared TypeScript types matching the backend API shapes
```