import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { EmployeeProvider } from './context/EmployeeContext';
import useAuth from './context/useAuth'; // ✅ FIXED: was '../context/useAuth' (wrong path)
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import ActivityLogs from './pages/ActivityLogs';
import EmployeeProfile from './pages/EmployeeProfile';
import Attendance from './pages/Attendance';
import ApplyLeave from './pages/ApplyLeave';
import LeaveApproval from './pages/LeaveApproval';
import CompleteProfile from './pages/CompleteProfile';
<<<<<<< HEAD
import AdminAttendance from './pages/AdminAttendance';
=======
>>>>>>> 93b8165bd87c5360229d96013264986a1782586d

// Guard: only admin can access
const AdminRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};

// Guard: only regular user (non-admin) can access
const UserRoute = ({ children }) => {
  const { user } = useAuth();
  return user?.role !== 'admin' ? children : <Navigate to="/" replace />;
};

// Guard: any authenticated user
const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <EmployeeProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login"    element={<Login />}    />
              <Route path="/register" element={<Register />} />

              <Route path="/" element={<Layout />}>
                {/* Common */}
                <Route index element={<Dashboard />} />

                {/* Admin only */}
                <Route path="employees"     element={<AdminRoute><Employees /></AdminRoute>} />
<<<<<<< HEAD
                <Route path="employees/:id"   element={<AdminRoute><EmployeeProfile /></AdminRoute>} />
                <Route path="activity"        element={<AdminRoute><ActivityLogs /></AdminRoute>} />
                <Route path="leave-approval"  element={<AdminRoute><LeaveApproval /></AdminRoute>} />
                <Route path="admin-attendance" element={<AdminRoute><AdminAttendance /></AdminRoute>} />
=======
                <Route path="employees/:id" element={<AdminRoute><EmployeeProfile /></AdminRoute>} />
                <Route path="activity"      element={<AdminRoute><ActivityLogs /></AdminRoute>} />
                <Route path="leave-approval" element={<AdminRoute><LeaveApproval /></AdminRoute>} />
>>>>>>> 93b8165bd87c5360229d96013264986a1782586d

                {/* User (employee) only */}
                <Route path="attendance"  element={<UserRoute><Attendance /></UserRoute>} />
                <Route path="apply-leave" element={<UserRoute><ApplyLeave /></UserRoute>} />

                {/* Profile completion (any logged-in user) */}
                <Route path="complete-profile" element={<PrivateRoute><CompleteProfile /></PrivateRoute>} />
              </Route>
            </Routes>
          </BrowserRouter>
        </EmployeeProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;