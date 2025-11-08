import React from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import StudentDashboard from './pages/StudentDashboard.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AllComplaints from './pages/AllComplaints.jsx'
import ResolvedComplaints from './pages/ResolvedComplaints.jsx'
import MessTimetable from './pages/MessTimetable.jsx'
import BusTimetable from './pages/BusTimetable.jsx'
import EntryExitLogs from './pages/EntryExitLogs.jsx'
import CleaningRequests from './pages/CleaningRequests.jsx'
import InternetIssues from './pages/InternetIssues.jsx'

const router = createBrowserRouter([
  { path: '/', element: <App />,
    children: [
      { index: true, element: <StudentDashboard /> },
      { path: 'admin', element: <AdminDashboard /> },
      { path: 'complaints', element: <AllComplaints /> },
      { path: 'resolved', element: <ResolvedComplaints /> },
      { path: 'mess', element: <MessTimetable /> },
      { path: 'bus', element: <BusTimetable /> },
      { path: 'logs', element: <EntryExitLogs /> },
      { path: 'cleaning', element: <CleaningRequests /> },
      { path: 'internet', element: <InternetIssues /> },
    ]
  },
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
])

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)

