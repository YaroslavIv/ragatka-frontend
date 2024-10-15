import React, { useState } from 'react';
import { TextField, Button, Container } from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await axios.post('http://localhost:5002/api/login', {
        email,
        password,
      });

      if (response.status === 200) {
        // Успешный вход, перенаправляем на страницу чата
        navigate('/chat');
      }
    } catch (err: any) {
      if (err.response && err.response.data) {
        setError(err.response.data.error); // Отображаем сообщение об ошибке
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  return (
    <Container maxWidth="sm">
      <form onSubmit={handleLogin}>
        <TextField
          label="Email"
          fullWidth
          margin="normal"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <TextField
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button type="submit" variant="contained" color="primary" fullWidth>
          Login
        </Button>
      </form>
    </Container>
  );
};

export default Login;
