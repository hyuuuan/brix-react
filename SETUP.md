# Bricks Attendance Management System - Standalone Setup

This is a complete, standalone full-stack application with React frontend and Express backend.

## Prerequisites

- Node.js 16 or higher
- MySQL (XAMPP or standalone)
- npm or yarn

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Backend

Create or edit `.env.backend` file with your database credentials:

```env
# Database Configuration for XAMPP
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=
DB_NAME=bricks_attendance

# Server Configuration
PORT=3000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=24h

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=200

# Security
BCRYPT_ROUNDS=12
```

### 3. Configure Frontend

Create or edit `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

### 4. Setup Database

Make sure MySQL is running (XAMPP or standalone), then:

```bash
# Import the database schema (you'll need the SQL file from the original project)
# Or run your database setup scripts
```

### 5. Start the Application

**Development mode (with hot reload):**
```bash
npm run start:dev
```

**Production mode:**
```bash
npm start
```

This will start:
- Backend server on http://localhost:3000
- Frontend dev server on http://localhost:5173

### Alternative: Run Frontend and Backend Separately

**Terminal 1 - Backend:**
```bash
npm run server        # Production
# or
npm run server:dev    # Development with nodemon
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

## Project Structure

```
react-app/
├── backend/              # Express backend
│   ├── database/        # Database connection and models
│   ├── middleware/      # Auth and validation middleware
│   ├── routes/          # API routes
│   └── services/        # Business logic
├── src/                 # React frontend
│   ├── components/      # React components
│   ├── hooks/          # Custom React hooks
│   ├── pages/          # Page components
│   ├── services/       # API services
│   └── utils/          # Utilities
├── public/             # Static assets
├── server.js           # Express server entry point
├── .env                # Frontend environment variables
└── .env.backend        # Backend environment variables
```

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run build` - Build frontend for production
- `npm run preview` - Preview production build
- `npm run server` - Start backend server
- `npm run server:dev` - Start backend with nodemon (auto-reload)
- `npm start` - Start both frontend and backend concurrently
- `npm run start:dev` - Start both with auto-reload
- `npm run lint` - Run ESLint

## Default Login

After setting up the database, use the default admin credentials:
- Username: `admin` (or check your database)
- Password: (check your database setup)

## Features

- 🔐 JWT-based authentication
- 👥 Employee management
- ⏰ Attendance tracking
- 💰 Payroll management
- ⚙️ System settings
- 📊 Analytics dashboard
- 🎨 Modern UI with Tailwind CSS
- 📱 Responsive design

## Tech Stack

**Frontend:**
- React 19
- Vite
- TanStack Query
- React Router
- Tailwind CSS v4
- Axios

**Backend:**
- Node.js
- Express
- MySQL
- JWT
- bcryptjs
- Helmet (security)
- Morgan (logging)

## Troubleshooting

### Database Connection Issues
- Ensure MySQL is running
- Check database credentials in `.env.backend`
- Verify database exists

### Port Already in Use
- Backend (3000): Change `PORT` in `.env.backend`
- Frontend (5173): Change in `vite.config.js`

### CORS Issues
- Backend is configured to allow localhost:5173
- If using different ports, update `server.js`

## Production Deployment

1. Build the frontend:
```bash
npm run build
```

2. Serve the built files with the backend:
- Update `server.js` to serve static files from `dist/`
- Or deploy frontend and backend separately

3. Set environment variables:
```bash
NODE_ENV=production
```

## Support

For issues or questions, refer to the main project documentation or contact the development team.
