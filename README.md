# Daybook API (Express + MongoDB)
1. `cp .env.example .env`, then fill MONGO_URI, JWT_SECRET, CLIENT_ORIGIN
2. `npm install && npm run dev`

| Method | Route | Auth | Purpose |
|---|---|---|---|
| POST | /api/auth/register, /login | none | returns JWT + user |
| GET | /api/auth/me | user | current user |
| GET | /api/entries?from&to | user | entries in range |
| GET/PUT/DELETE | /api/entries/:date | user | read, partial upsert, delete one day |
| DELETE | /api/entries | user | wipe own data |
| GET | /api/stats?from&to | user | averages, totals, flag counts, daily series |
| GET | /api/admin/users | admin | list users |
| DELETE | /api/admin/users/:id | admin | remove user and their data |

Deploy (Render/Railway): build `npm install`, start `npm start`, add the env vars from `.env.example`.
Atlas: allow the host's IP (or 0.0.0.0/0) under Network Access.
