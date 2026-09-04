import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = () => {
  const { loading, user } = useContext(AuthContext);
  if (loading) return <div className="p-4">Loading…</div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
