# TaskFlow — Frontend

React + TypeScript + Vite + Tailwind CSS frontend for the TaskFlow task board.

Full setup instructions (backend + frontend, environment variables, data model, etc.) are in the [root README](../README.md).

## Quick start

```bash
npm install
cp .env.example .env    # fill in VITE_API_URL and VITE_BOARD_ID
npm run dev
```

Requires the backend to be running (see root README) and a seeded board id in `.env`.

## Structure

```
src/
├── api/            # axios client + endpoint wrapper functions
├── components/
│   ├── Board.tsx        # fetches and renders the board, handles loading/error state
│   ├── Column.tsx        # renders one column, its tasks, and "add task"
│   ├── TaskCard.tsx       # a single task: edit, delete, move via dropdown
│   ├── TaskModal.tsx      # shared create/edit form
│   └── PriorityFilter.tsx # dropdown to filter visible tasks by priority
└── types/types.ts   # shared TypeScript types matching the backend API shapes
```