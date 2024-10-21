import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  if (!isAuthenticated) {
    return <Navigate to="/" />; // Если пользователь не аутентифицирован, перенаправляем на страницу логина
  }

  return <>{children}</>; // Если пользователь аутентифицирован, рендерим компонент
};

export default ProtectedRoute;
