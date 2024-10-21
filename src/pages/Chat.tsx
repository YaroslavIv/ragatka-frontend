import React, { useState, useEffect, useRef } from 'react';
import { Button, TextField, Container, ListItem, ListItemText, Box, Typography } from '@mui/material';
import Navbar from '../components/Navbar';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';

interface Message {
  text: string;
  sender: 'client' | 'server'; // Индикатор отправителя (клиент или сервер)
}

// Извлечение токена из localStorage
const token = localStorage.getItem('authToken');

// Подключаем WebSocket с передачей токена к порту 5000
const socket = io('http://localhost:4000', {
  query: {
    token: token ? `Bearer ${token}` : '' // Передаем токен при подключении
  }
});

const Chat: React.FC = () => {
  const [message, setMessage] = useState(''); // Текущее сообщение
  const [messages, setMessages] = useState<Message[]>([]); // История сообщений с указанием отправителя
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Для обработки ошибок
  const navigate = useNavigate();

  const chatEndRef = useRef<HTMLDivElement | null>(null); // Для прокрутки к последнему сообщению

  // Обработка получения нового сообщения от сервера
  useEffect(() => {
    socket.on('connect', () => {
      console.log('WebSocket connected');
    });
  
    socket.on('message', (msg: any) => {
      // Проверяем, является ли сообщение строкой или объектом
      if (typeof msg === 'string') {
        // Сообщение как строка
        setMessages((prevMessages) => [...prevMessages, { text: msg, sender: 'server' }]);
      } else if (msg.error) {
        // Обработка ошибки
        setError(msg.error);
      }
    });
  
    socket.on('error', (err: string) => {
      console.error('Socket error:', err);
      setError('Ошибка подключения. Пожалуйста, войдите заново.');
      localStorage.removeItem('authToken');
      setIsAuthenticated(false);
      navigate('/'); // Перенаправляем на страницу логина
    });
  
    return () => {
      socket.off('message');
      socket.off('error'); // Отключаем обработчики при размонтировании компонента
    };
  }, [navigate]);
  

  // Прокрутка к последнему сообщению при добавлении нового сообщения
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Отправка сообщения на сервер
  const handleSend = () => {
    // Извлекаем токен перед отправкой сообщения
    const token = localStorage.getItem('authToken');
    
    if (message.trim()) {
      // Отправляем сообщение и токен
      socket.emit('message', { text: message, token });
      setMessages((prevMessages) => [...prevMessages, { text: message, sender: 'client' }]);
      setMessage('');
    }
  };
  

  // Обработка нажатия клавиши Enter
  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Предотвращаем перенос строки
      handleSend(); // Отправляем сообщение при нажатии Enter
    }
  };

  return (
    <>
      <Navbar title="Chat" setIsAuthenticated={setIsAuthenticated} />
      <Container
        maxWidth="sm"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          paddingTop: '64px',
        }}
      >
        {/* Область с историей сообщений */}
        <Box
          sx={{
            flexGrow: 1,
            overflowY: 'auto',
            padding: '10px',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            marginTop: '10px',
            marginBottom: '10px',
          }}
        >
          {messages.map((msg, index) => (
            <ListItem
              key={index}
              sx={{
                display: 'flex',
                justifyContent: msg.sender === 'client' ? 'flex-end' : 'flex-start',
              }}
            >
              <Box
                sx={{
                  backgroundColor: msg.sender === 'client' ? '#1976d2' : '#e0e0e0',
                  color: msg.sender === 'client' ? '#fff' : '#000',
                  borderRadius: '10px',
                  padding: '10px 15px',
                  maxWidth: '60%',
                  wordWrap: 'break-word',
                  whiteSpace: 'pre-wrap',
                  position: 'relative',
                }}
              >
                <ListItemText primary={msg.text} />
                {/* Добавляем эмодзи под сообщение */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: msg.sender === 'client' ? 'flex-end' : 'flex-start',
                    marginTop: '5px',
                  }}
                >
                  {msg.sender === 'client' ? (
                    <>
                      <Typography variant="caption" color="inherit">
                        Отправлено
                      </Typography>
                      <span role="img" aria-label="user" style={{ fontSize: '24px', marginLeft: '5px' }}>
                        😀
                      </span>
                    </>
                  ) : (
                    <>
                      <Typography variant="caption" color="inherit">
                        Сервер
                      </Typography>
                      <span role="img" aria-label="robot" style={{ fontSize: '24px', marginLeft: '5px' }}>
                        🤖
                      </span>
                    </>
                  )}
                </Box>
              </Box>
            </ListItem>
          ))}
          <div ref={chatEndRef} />
        </Box>

        {/* Фиксированная область для ввода сообщения */}
        <Box
          sx={{
            borderTop: '1px solid #ddd',
            padding: '10px 0',
            backgroundColor: '#f4f6f8', // Устанавливаем общий фон
            position: 'sticky',
            bottom: 0,
            width: '100%',
          }}
        >
          <TextField
            fullWidth
            label="Type your message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress} // Добавляем обработчик клавиши Enter
            sx={{
              marginBottom: '10px',
              backgroundColor: '#fff', // Белый фон для текстового поля
              borderRadius: '4px',
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            fullWidth
            sx={{
              backgroundColor: '#1976d2', // Цвет кнопки
              '&:hover': {
                backgroundColor: '#115293', // Цвет кнопки при наведении
              },
            }}
          >
            Send
          </Button>
        </Box>
      </Container>
    </>
  );
};

export default Chat;
