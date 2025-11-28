# Bricks Attendance Management System

A modern, full-stack employee attendance management system built with React and Express.

## 🚀 Quick Start

This is a **standalone application** containing both frontend and backend. No external dependencies needed!

### Prerequisites
- Node.js 16+
- MySQL (XAMPP or standalone)

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure backend** (edit `.env.backend`):
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=bricks_attendance
PORT=3000
JWT_SECRET=your_secret_key_here
```

3. **Configure frontend** (edit `.env`):
```env
VITE_API_URL=http://localhost:3000/api
```

4. **Start the application:**
```bash
npm start
```

This will start both the backend server (port 3000) and frontend dev server (port 5173).

Visit **http://localhost:5173** to use the application.

## 📁 Project Structure

```
react-app/
├── backend/              # Express.js backend
│   ├── database/        # Database connection & models
│   ├── middleware/      # Authentication & validation
│   ├── routes/          # API endpoints
│   └── services/        # Business logic
├── src/                 # React frontend
│   ├── components/      # Reusable UI components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   └── services/       # API integration
├── public/             # Static assets
├── server.js           # Backend entry point
├── .env                # Frontend config
└── .env.backend        # Backend config
```

## 🛠️ Available Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start both frontend & backend |
| `npm run dev` | Start frontend only (dev mode) |
| `npm run server` | Start backend only |
| `npm run server:dev` | Start backend with auto-reload |
| `npm run start:dev` | Start both with auto-reload |
| `npm run build` | Build frontend for production |
| `npm run preview` | Preview production build |

## ✨ Features

- 🔐 JWT Authentication with role-based access control
- 👥 Employee Management (CRUD operations)
- ⏰ Attendance Tracking (clock in/out, break management)
- 💰 Payroll Management
- 📊 Real-time Analytics Dashboard
- ⚙️ System Settings
- 🎨 Modern UI with Tailwind CSS
- 📱 Fully Responsive Design

## 🏗️ Tech Stack

**Frontend:**
- React 19
- Vite
- TanStack Query (React Query)
- React Router v7
- Tailwind CSS v4
- Axios

**Backend:**
- Express.js
- MySQL
- JWT
- bcryptjs
- Helmet (Security)
- Morgan (Logging)

## 🔐 Authentication Flow

1. User enters credentials on /login
2. Frontend calls POST /api/auth/login
3. Backend returns JWT token and user data
4. Token stored in localStorage as `directflow_token`
5. All subsequent API calls include Authorization: Bearer <token> header

## 📖 Documentation

For detailed setup instructions, see [SETUP.md](./SETUP.md)

## 🎨 Design

The UI follows a modern, clean design inspired by Postman with orange accent colors and a professional white theme throughout.

## 🔧 Development

**Run frontend and backend separately:**

Terminal 1:
```bash
npm run server:dev
```

Terminal 2:
```bash
npm run dev
```

## 🐛 Troubleshooting

**Database connection failed:**
- Ensure MySQL is running
- Check credentials in `.env.backend`

**Port already in use:**
- Change `PORT` in `.env.backend` for backend
- Vite will automatically use next available port for frontend

**CORS errors:**
- Verify `VITE_API_URL` in `.env` matches your backend URL

## 📄 License

MIT

---

Made with ❤️ for Bricks Company
