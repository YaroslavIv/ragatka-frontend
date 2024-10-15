import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" />; // Перенаправление на страницу логина, если не авторизован
  }

  return <>{children}</>; // Если авторизован, рендерим компонент
};

export default ProtectedRoute;
