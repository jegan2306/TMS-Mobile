import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Departments from './pages/Departments';
import Programmes from './pages/Programmes';
import Blocks from './pages/Blocks';
import Rooms from './pages/Rooms';
import Roles from './pages/Roles';
import Users from './pages/Users';
import Complaints from './pages/Complaints';
import RaiseComplaint from './pages/RaiseComplaint';
import Reports from './pages/Reports';

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role?.name)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        
        {/* Master Screens - SuperAdmin Only */}
        <Route path="departments" element={
          <ProtectedRoute allowedRoles={['Superadmin']}>
            <Departments />
          </ProtectedRoute>
        } />
        <Route path="programmes" element={
          <ProtectedRoute allowedRoles={['Superadmin']}>
            <Programmes />
          </ProtectedRoute>
        } />
        <Route path="blocks" element={
          <ProtectedRoute allowedRoles={['Superadmin']}>
            <Blocks />
          </ProtectedRoute>
        } />
        <Route path="rooms" element={
          <ProtectedRoute allowedRoles={['Superadmin']}>
            <Rooms />
          </ProtectedRoute>
        } />
        <Route path="roles" element={
          <ProtectedRoute allowedRoles={['Superadmin']}>
            <Roles />
          </ProtectedRoute>
        } />
        <Route path="users" element={
          <ProtectedRoute allowedRoles={['Superadmin']}>
            <Users />
          </ProtectedRoute>
        } />
        
        {/* Transaction Screens */}
        <Route path="complaints" element={<Complaints />} />
        <Route path="raise-complaint" element={
          <ProtectedRoute allowedRoles={['User']}>
            <RaiseComplaint />
          </ProtectedRoute>
        } />
        
        {/* Reports - SuperAdmin & Faculty */}
        <Route path="reports" element={
          <ProtectedRoute allowedRoles={['Superadmin', 'Faculty']}>
            <Reports />
          </ProtectedRoute>
        } />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
