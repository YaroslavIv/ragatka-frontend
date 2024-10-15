import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';

interface NavbarProps {
  title: string; // Пропс для заголовка, который будет меняться в зависимости от страницы
}

const Navbar: React.FC<NavbarProps> = ({ title }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Логика выхода: удаляем токен и сбрасываем состояние аутентификации
    localStorage.removeItem('authToken'); // Удаляем токен из localStorage
    navigate('/'); // Перенаправляем на страницу логина
  };

  return (
    <AppBar position="fixed">
      <Toolbar>
        {/* Отображаем заголовок страницы */}
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        
        {/* Ссылки на страницы */}
        <Button color="inherit" component={Link} to="/upload">
          Upload
        </Button>
        <Button color="inherit" component={Link} to="/chat">
          Chat
        </Button>
        
        {/* Кнопка выхода */}
        <Button color="inherit" onClick={handleLogout}>
          Logout
        </Button>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
