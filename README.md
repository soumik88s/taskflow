# TaskFlow — Full Stack SaaS Task Management System

TaskFlow is a production-quality, modern, responsive **Task Management System** built as a full-stack SaaS workspace.

---

## 🌟 Key Features

- **Guest Authentication**: One-click guest access issuing secure signed JWT tokens.
- **REST API Architecture**: Full CRUD endpoints (`GET`, `POST`, `PATCH`, `DELETE`) with request validation and error handling.
- **Persistent Database Engine**: Automatic dataset storage and user isolation.
- **Interactive Dashboard & Statistics**: Real-time stats cards for Total Tasks, To Do, In Progress, and Completed tasks.
- **Smart Search & Filtering**: Real-time title/description debounced search, priority filter, status tabs, and multi-field sorting.
- **Interactive Task Workflow**: Animated completion checkboxes, confetti micro-interactions, context menus, and delete confirmation dialogs.
- **Dark & Light Mode**: Seamless dark/light/system theme toggling with zero flash and persistence.
- **Responsive Layout**: Desktop sidebar navigation, tablet compact view, and mobile bottom bar navigation.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Motion (Framer Motion), Lucide Icons, Canvas Confetti.
- **Backend**: Express REST API, Node.js, TypeScript (`tsx`).
- **Authentication**: JSON Web Tokens (JWT) with Bearer header verification.
- **Persistence**: File-backed database engine with local fallback and seed dataset.

---

## 🚀 API Documentation

### Auth Endpoints
- `POST /api/auth/guest` — Creates/retrieves guest session and returns JWT token.
- `GET /api/auth/me` — Fetches profile for current authenticated user token.

### Task Endpoints
- `GET /api/tasks` — Lists user's tasks with query filters (`status`, `priority`, `search`, `sort`).
- `GET /api/tasks/stats` — Computes dynamic workspace statistics.
- `POST /api/tasks` — Creates new task (validated title, priority, status, optional due date).
- `PATCH /api/tasks/:id` — Updates task properties or toggles completion status.
- `DELETE /api/tasks/:id` — Removes task permanently.
- `POST /api/tasks/seed` — Reseeds default sample dataset.

---

## 💻 Local Development & Build

```bash
# Install dependencies
npm install

# Run dev server (Express + Vite on http://0.0.0.0:3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```
