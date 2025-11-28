# Quick Start Guide - Bricks Attendance React App

## ✅ Setup Complete

Your React frontend has been successfully scaffolded and is ready to use!

## 📂 Project Location

```
/Users/senzuka/WebDev/Bricks/react-app/
```

## 🚀 How to Run

### 1. Start the Backend Server (Required First!)

Open a terminal and run:

```bash
cd /Users/senzuka/WebDev/Bricks/Attendance-IM2-
npm start
```

The backend will run on `http://localhost:3000`

### 2. Start the React Development Server

Open a NEW terminal and run:

```bash
cd /Users/senzuka/WebDev/Bricks/react-app
npm run dev
```

The React app will run on `http://localhost:5173`

### 3. Open in Browser

Navigate to: `http://localhost:5173`

You should see the login page!

## 🔐 Test Login

Use your existing credentials from the backend database to log in.

## 📁 What's Been Created

### ✅ Core Infrastructure
- ✅ React 19 + Vite setup
- ✅ TailwindCSS configured
- ✅ React Router v7 with protected routes
- ✅ Axios API client with interceptors
- ✅ React Query for data fetching

### ✅ API Services Layer
- ✅ `src/api/client.js` - Axios instance with JWT auth
- ✅ `src/api/auth.js` - Authentication API
- ✅ `src/api/employees.js` - Employee management
- ✅ `src/api/attendance.js` - Attendance tracking
- ✅ `src/api/payroll.js` - Payroll management
- ✅ `src/api/settings.js` - System settings

### ✅ Authentication System
- ✅ `src/contexts/AuthContext.jsx` - Auth state management
- ✅ JWT token handling (localStorage)
- ✅ Auto token refresh
- ✅ Protected routes with role-based access

### ✅ Custom Hooks
- ✅ `src/hooks/useEmployees.js` - Employee data hooks
- ✅ `src/hooks/useAttendance.js` - Attendance hooks
- ✅ `src/hooks/usePayroll.js` - Payroll hooks

### ✅ Layout Components
- ✅ `src/components/layout/Layout.jsx` - Main wrapper
- ✅ `src/components/layout/Sidebar.jsx` - Navigation sidebar
- ✅ `src/components/layout/Header.jsx` - Top header
- ✅ `src/components/ProtectedRoute.jsx` - Route guard

### ✅ Pages (Scaffolding)
- ✅ `src/pages/Login.jsx` - Full login page
- ✅ `src/pages/Dashboard.jsx` - Dashboard with stats
- ✅ `src/pages/Employees.jsx` - Placeholder
- ✅ `src/pages/Attendance.jsx` - Placeholder
- ✅ `src/pages/Payroll.jsx` - Placeholder
- ✅ `src/pages/Settings.jsx` - Placeholder

## 🔌 Backend Connection

The React app is configured to connect to your Express.js backend:

- **Development**: Vite proxy forwards `/api/*` to `http://localhost:3000`
- **Production**: Set `VITE_API_URL` in `.env` file

## 🎯 Next Steps (Future Implementation)

### Phase 1: Complete Dashboard
- [ ] Add real-time charts (ApexCharts)
- [ ] Calendar component
- [ ] Quick action buttons
- [ ] Auto-refresh data

### Phase 2: Employee Management
- [ ] Employee list with search/filter
- [ ] Create/Edit employee forms
- [ ] Employee details page
- [ ] Bulk operations

### Phase 3: Attendance Features
- [ ] Clock in/out interface
- [ ] Break management
- [ ] Manual entry forms
- [ ] Attendance records table
- [ ] Date range filters

### Phase 4: Payroll System
- [ ] Payroll generation wizard
- [ ] Payroll records table
- [ ] Deductions calculator
- [ ] PDF export

### Phase 5: Analytics & Settings
- [ ] Charts and visualizations
- [ ] Export functionality
- [ ] System settings forms
- [ ] User preferences

## 🛠️ Available Commands

```bash
npm run dev      # Start development server (http://localhost:5173)
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

## 📊 Current Status

✅ **WORKING:**
- Authentication system
- API connection to backend
- Protected routes
- Role-based access control
- Login page
- Dashboard with live stats from API
- Sidebar navigation
- Layout structure

🚧 **SCAFFOLDING ONLY:**
- Employee management pages (UI needs implementation)
- Attendance tracking pages (UI needs implementation)
- Payroll pages (UI needs implementation)
- Settings pages (UI needs implementation)

## 🔍 Testing the Connection

1. Start both servers (backend + frontend)
2. Open `http://localhost:5173`
3. Login with valid credentials
4. You should see the dashboard with real data from the API
5. Check browser console - you should see API requests

## 💡 Pro Tips

- **Hot Module Replacement**: Changes to your code auto-reload in the browser
- **React DevTools**: Install the browser extension for debugging
- **Network Tab**: Monitor API calls in browser DevTools
- **Console Logs**: Check for any connection errors

## 🐛 Troubleshooting

### Backend Connection Failed
- Ensure backend is running on port 3000
- Check `.env` file has correct API URL
- Verify no CORS errors in console

### Login Not Working
- Check backend database has user accounts
- Verify JWT secret is configured in backend
- Check browser console for API errors

### Build Errors
- Run `npm install` to ensure all dependencies are installed
- Delete `node_modules` and reinstall if needed
- Check for TypeScript/ESLint errors

## 📞 Support

Check the main README.md for detailed documentation.

---

**Ready to develop!** 🎉

Start both servers and begin building out the remaining pages!
