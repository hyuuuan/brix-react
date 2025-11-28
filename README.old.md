# Bricks Attendance System - React Frontend

Modern React frontend for the Bricks Attendance Management System, built with Vite, React Router, TailwindCSS, and React Query.

## 🚀 Features

- **Authentication**: JWT-based authentication with protected routes
- **Dashboard**: Real-time statistics and overview
- **Employee Management**: CRUD operations for employee data
- **Attendance Tracking**: Clock in/out, break management, and attendance records
- **Payroll Management**: Payroll generation and management
- **Settings**: System configuration and settings
- **Role-Based Access Control**: Admin, Manager, and Employee roles

## 📋 Prerequisites

- Node.js >= 16.0.0
- npm or yarn
- Backend API running on http://localhost:3000 (from Attendance-IM2- folder)

## 🛠️ Installation

```bash
# Navigate to the react-app directory
cd /Users/senzuka/WebDev/Bricks/react-app

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
```

## 🏃 Running the Application

### Development Mode

```bash
npm run dev
```

The app will be available at http://localhost:5173

### Production Build

```bash
npm run build
npm run preview
```

## 🔌 API Integration

The React app connects to the Express.js backend running in the Attendance-IM2- folder.

### Development Setup

1. **Start the backend server** (from Attendance-IM2- folder):
   ```bash
   cd /Users/senzuka/WebDev/Bricks/Attendance-IM2-
   npm start
   ```

2. **Start the React app** (from react-app folder):
   ```bash
   cd /Users/senzuka/WebDev/Bricks/react-app
   npm run dev
   ```

## 🔐 Authentication Flow

1. User enters credentials on /login
2. Frontend calls POST /api/auth/login
3. Backend returns JWT token and user data
4. Token stored in localStorage as directflow_token
5. All subsequent API calls include Authorization: Bearer <token> header

## 📦 Key Dependencies

- **React 19**: UI library
- **React Router v7**: Client-side routing
- **TanStack Query**: Server state management
- **Axios**: HTTP client
- **TailwindCSS**: Utility-first CSS framework
- **Vite**: Build tool and dev server
