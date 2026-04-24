import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StaffDashboard from './pages/StaffDashboard';

const PrivateRoute = ({ children, roleRequired }) => {
  const { user } = useContext(AuthContext);
  if (!user) return <Navigate to="/" />;
  if (roleRequired && user.role !== roleRequired) return <Navigate to="/" />;
  return children;
};

function App() {
  const { user } = useContext(AuthContext);
  
  return (
    <div className="app-container">
      <Routes>
        <Route path="/" element={
          user?.role === 'admin' ? <Navigate to="/admin" /> 
          : user?.role === 'staff' ? <Navigate to="/staff" /> 
          : <Login />
        } />
        <Route path="/admin/*" element={
          <PrivateRoute roleRequired="admin">
            <AdminDashboard />
          </PrivateRoute>
        } />
        <Route path="/staff/*" element={
          <PrivateRoute roleRequired="staff">
            <StaffDashboard />
          </PrivateRoute>
        } />
      </Routes>
    </div>
  );
}

export default App;
