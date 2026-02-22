# TaskFlow — Full-Stack Web App

> Frontend Developer Intern Assignment · Built with Next.js 14, Node.js/Express, MongoDB, and JWT Auth.

---

## 🗂 Project Structure

```
Frontend Developer/
├── backend/          ← Express API (Node.js + MongoDB)
├── frontend/         ← Next.js 14 + TailwindCSS
├── docs/
│   ├── postman_collection.json
│   └── SCALING_NOTES.md
└── README.md
```

---

## ⚙️ Setup & Run

### Prerequisites
- Node.js 18+
- **MongoDB** — choose one of:
  - **Local:** Install [MongoDB Community](https://www.mongodb.com/try/download/community) and run `mongod` in a terminal
  - **Cloud (recommended):** Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com), then paste the connection string into `backend/.env` as `MONGO_URI`

---

### 1. Backend

```bash
cd backend
npm install
# Edit .env if needed (MONGO_URI, JWT_SECRET)
npm run dev
```

Server starts on **http://localhost:5000**

---

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on **http://localhost:3000**

---

## 🔑 Environment Variables

### `backend/.env`
| Variable     | Default                                           | Description              |
|--------------|---------------------------------------------------|--------------------------|
| `PORT`       | `5000`                                            | Server port              |
| `MONGO_URI`  | `mongodb://localhost:27017/webapp_db`             | MongoDB connection string |
| `JWT_SECRET` | (set a strong secret)                             | JWT signing secret       |
| `JWT_EXPIRE` | `7d`                                              | Token expiry             |

### `frontend/.env.local`
| Variable               | Default                        |
|------------------------|--------------------------------|
| `NEXT_PUBLIC_API_URL`  | `http://localhost:5000/api`    |

---

## 📡 API Reference

Base URL: `http://localhost:5000/api`

### Auth
| Method | Endpoint              | Auth | Description               |
|--------|-----------------------|------|---------------------------|
| POST   | `/auth/register`      | No   | Register a new user       |
| POST   | `/auth/login`         | No   | Login and receive JWT     |

### Profile
| Method | Endpoint   | Auth | Description              |
|--------|------------|------|--------------------------|
| GET    | `/profile` | JWT  | Get current user profile |
| PUT    | `/profile` | JWT  | Update name and bio      |

### Tasks
| Method | Endpoint         | Auth | Description                              |
|--------|------------------|------|------------------------------------------|
| GET    | `/tasks`         | JWT  | Get all user tasks (search/filter/sort)  |
| GET    | `/tasks/:id`     | JWT  | Get a single task by ID                  |
| POST   | `/tasks`         | JWT  | Create a new task (supports `dueDate`)   |
| PUT    | `/tasks/:id`     | JWT  | Update a task (supports `dueDate`)       |
| DELETE | `/tasks/:id`     | JWT  | Delete a task                            |

#### GET `/tasks` Query Params
| Param      | Values                              |
|------------|-------------------------------------|
| `search`   | Any string (searches title + desc)  |
| `status`   | `todo`, `in-progress`, `done`       |
| `priority` | `low`, `medium`, `high`             |
| `sort`     | `newest`, `oldest`, `az`, `za`      |

---

## 🔐 Authentication Flow

1. Register → receive JWT token
2. Login → receive JWT token  
3. All protected routes require: `Authorization: Bearer <token>`
4. Token stored in `localStorage`, injected via Axios interceptor
5. On 401 response, user is automatically logged out and redirected to `/login`

---

## 🏗 Tech Stack

| Layer     | Technology                    |
|-----------|-------------------------------|
| Frontend  | Next.js 14, TailwindCSS, TypeScript |
| Backend   | Node.js, Express              |
| Database  | MongoDB (Mongoose)            |
| Auth      | JWT + bcrypt (12 salt rounds) |
| Security  | Helmet, CORS, Rate Limiting   |

---

## 📮 Postman Collection

Import `docs/postman_collection.json` into Postman.  
Set the `base_url` variable to `http://localhost:5000/api` and `token` to your JWT.

---

## 📈 Scaling Notes

See [`docs/SCALING_NOTES.md`](./docs/SCALING_NOTES.md)
