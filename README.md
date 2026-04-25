# Team Skill Matrix Graph

A full-stack web app to visualize your team's skills as an interactive graph.

- **Frontend**: React (Create React App) + React Flow + Bootstrap 5
- **Backend**: Node.js + Express
- **Database**: MongoDB (Mongoose)
- **Auth**: JWT + bcrypt

---

## Features

- Signup / Login with JWT (token stored in `localStorage`)
- People & Skills CRUD with form validation
- Connect a Person to a Skill with proficiency: **learning** (yellow), **familiar** (blue), **expert** (green)
- Drag, zoom, and interactively connect nodes in a React Flow canvas
- Click a Person → side panel with their skills
- Click a Skill → side panel listing everyone who has it
- Highlight connected nodes & dim the rest
- Dashboard with totals, most common skills, and skill gaps
- Responsive sidebar layout
- Graph layout (node positions) is persisted per-browser in `localStorage`

---

## Project Structure

```
team-skill-matrix-graph/
├── backend/
│   ├── server.js            # Express entry point
│   ├── config/db.js         # MongoDB connection
│   ├── middleware/auth.js   # JWT verification middleware
│   ├── models/              # Mongoose schemas (User, Person, Skill, Connection)
│   ├── routes/              # auth, people, skills, connections
│   └── .env.example
└── frontend/
    ├── public/index.html
    └── src/
        ├── api/api.js          # axios + auth interceptor
        ├── context/AuthContext.js
        ├── components/         # Sidebar, Layout, modals, custom React Flow nodes
        └── pages/              # Login, Signup, Dashboard, GraphView, People, Skills
```

---

## Prerequisites

- **Node.js** v18 or newer
- **MongoDB** running locally on `mongodb://127.0.0.1:27017` *(or use a MongoDB Atlas connection string)*
- **npm** (comes with Node)

If you don't have MongoDB locally, the easiest path is a free Atlas cluster: https://www.mongodb.com/cloud/atlas — copy your connection string into `backend/.env`.

---

## How to Run

Open **two terminal windows** — one for the backend and one for the frontend.

### 1) Backend

```bash
cd team-skill-matrix-graph/backend
cp .env.example .env        # then edit .env if needed
npm install
npm run dev                 # or: npm start
```

The API will start on **http://localhost:5000**.

Sanity check: `curl http://localhost:5000/api/health` → `{"status":"ok"}`

### 2) Frontend

```bash
cd team-skill-matrix-graph/frontend
npm install
npm start
```

The app will open at **http://localhost:3000**.

The frontend's `package.json` includes `"proxy": "http://localhost:5000"`, so all `/api/*` calls from the React dev server are forwarded to the backend automatically — no CORS configuration needed in development.

### 3) Use it

1. Visit http://localhost:3000 → sign up for an account
2. Add a few people on the **People** page
3. Add a few skills on the **Skills** page
4. Open **Graph View** and either:
   - Click **+ Connect Person ↔ Skill** to choose person/skill/proficiency, or
   - Drag from a Person node's right handle onto a Skill node's left handle
5. Click any node to see its details in the side panel

---

## Environment Variables (backend/.env)

| Variable         | Default                                              | Notes                                  |
| ---------------- | ---------------------------------------------------- | -------------------------------------- |
| `PORT`           | `5000`                                               | Backend port                           |
| `MONGO_URI`      | `mongodb://127.0.0.1:27017/team_skill_matrix`        | Local MongoDB or Atlas URI             |
| `JWT_SECRET`     | `devsecret` *(fallback)*                             | **Set this in production**             |
| `JWT_EXPIRES_IN` | `7d`                                                 | Token lifetime                         |

---

## API Reference

All routes (except auth) require an `Authorization: Bearer <token>` header.

**Auth**
- `POST /api/auth/signup` — `{ name, email, password }` → `{ token, user }`
- `POST /api/auth/login` — `{ email, password }` → `{ token, user }`

**People**
- `GET /api/people`
- `POST /api/people` — `{ name, role }`
- `PUT /api/people/:id`
- `DELETE /api/people/:id`

**Skills**
- `GET /api/skills`
- `POST /api/skills` — `{ name, category }`
- `PUT /api/skills/:id`
- `DELETE /api/skills/:id`

**Connections**
- `GET /api/connections`
- `POST /api/connections` — `{ personId, skillId, proficiency }` *(proficiency: `learning` | `familiar` | `expert`)*
- `DELETE /api/connections/:id`

Duplicate `personId + skillId` connections are blocked at the database level (unique compound index) and return HTTP 409.

---

## Production Build

Frontend:
```bash
cd frontend
npm run build           # outputs static assets to frontend/build
```

Serve `frontend/build` from any static host (Nginx, Vercel, Netlify) and point the API at your deployed backend by setting `REACT_APP_API_URL=https://your-api.example.com/api` before `npm run build`.

---

## Troubleshooting

- **`MongoDB connection error: ECONNREFUSED`** → MongoDB isn't running. Start it (`brew services start mongodb-community` on macOS, `sudo systemctl start mongod` on Linux) or use an Atlas URI.
- **Login works but API calls 401** → Clear `localStorage` and log in again. JWT may have expired.
- **Port 3000 / 5000 already in use** → change `PORT` in `backend/.env` and update the `proxy` field in `frontend/package.json` to match.
