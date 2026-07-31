import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { type JSX } from 'react';

interface ProtectedRouteProps {
  children: JSX.Element;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}