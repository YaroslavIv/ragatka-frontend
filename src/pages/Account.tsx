import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Button } from '@mui/material';
import Navbar from '../components/Navbar';
import axios, { AxiosError } from 'axios'; // Импортируем AxiosError для работы с ошибками
import { useNavigate } from 'react-router-dom';

interface AccountProps {
  setIsAuthenticated: (authStatus: boolean) => void;
}

const Account: React.FC<AccountProps> = ({ setIsAuthenticated }) => {
  const [userEmail, setUserEmail] = useState<string>(''); // Email пользователя
  const [userName, setUserName] = useState<string>(''); // Имя пользователя
  const [loading, setLoading] = useState<boolean>(true); // Для отображения статуса загрузки
  const [error, setError] = useState<string | null>(null); // Для отображения ошибок
  const navigate = useNavigate();

  useEffect(() => {
    // Запрос данных пользователя с сервера
    const fetchUserData = async () => {
      const token = localStorage.getItem('authToken'); // Получаем токен из localStorage
      if (!token) {
        setError('Token is missing, please log in.');
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get('http://localhost:5000/api/user', {
          headers: {
            Authorization: `Bearer ${token}`, // Передаем токен в заголовке
          },
        });

        const { userName, userEmail } = response.data;
        setUserName(userName); // Сохраняем имя пользователя
        setUserEmail(userEmail); // Сохраняем email
        setLoading(false); // Останавливаем индикатор загрузки
      } catch (err) {
        const axiosError = err as AxiosError; // Приведение типа err к AxiosError
        console.error('Ошибка при загрузке данных пользователя:', axiosError);
        setError('Ошибка при получении данных пользователя.');
        setLoading(false);
        if (axiosError.response?.status === 403) {
          // Если токен недействителен, перенаправляем на страницу логина
          localStorage.removeItem('authToken');
          setIsAuthenticated(false);
          navigate('/');
        }
      }
    };

    fetchUserData();
  }, [navigate, setIsAuthenticated]);

  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Удаляем токен из localStorage при выходе
    setIsAuthenticated(false); // Устанавливаем состояние неаутентифицированного пользователя
    navigate('/'); // Перенаправляем на страницу логина
  };

  return (
    <>
      <Navbar title="Account" setIsAuthenticated={setIsAuthenticated} />
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            height: '100vh',
            textAlign: 'center',
            paddingTop: '64px', // Для компенсации Navbar
          }}
        >
          {loading ? (
            <Typography variant="h6">Загрузка данных...</Typography>
          ) : error ? (
            <Typography variant="h6" color="error">{error}</Typography>
          ) : (
            <>
              <Typography variant="h4" gutterBottom>
                Учетные данные
              </Typography>
              <Typography variant="h6">Имя пользователя: {userName}</Typography>
              <Typography variant="h6">Email: {userEmail}</Typography>
              <Button
                variant="contained"
                color="primary"
                onClick={handleLogout}
                sx={{ marginTop: '20px' }}
              >
                Выйти
              </Button>
            </>
          )}
        </Box>
      </Container>
    </>
  );
};

export default Account;
