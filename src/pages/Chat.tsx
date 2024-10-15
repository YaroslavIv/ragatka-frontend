import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar'; // Импортируем компонент Navbar
import { Button, TextField, Container, List, ListItem, ListItemText } from '@mui/material';
import io from 'socket.io-client'; // Импортируем socket.io-client

// Подключаем WebSocket (замени URL на свой сервер)
const socket = io('http://localhost:4000');

const Chat: React.FC = () => {
  const [message, setMessage] = useState(''); // Текущее сообщение
  const [messages, setMessages] = useState<string[]>([]); // История сообщений

  const chatEndRef = useRef<HTMLDivElement | null>(null); // Для прокрутки к последнему сообщению

  // Обработка получения нового сообщения от сервера
  useEffect(() => {
    socket.on('message', (msg: string) => {
      setMessages((prevMessages) => [...prevMessages, msg]);
    });

    return () => {
      socket.off('message'); // Отключаем обработчик при размонтировании компонента
    };
  }, []);

  // Прокрутка к последнему сообщению при добавлении нового сообщения
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Отправка сообщения на сервер
  const handleSend = () => {
    if (message.trim()) {
      socket.emit('message', message); // Отправляем сообщение на сервер
      setMessages((prevMessages) => [...prevMessages, message]); // Добавляем сообщение в историю локально
      setMessage(''); // Очищаем поле ввода
    }
  };

  return (
    <>
      <Navbar title="Chat" />
      <Container
        maxWidth="sm"
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          paddingTop: '64px',
        }}
      >
        {/* Список сообщений */}
        <List style={{ flexGrow: 1, overflowY: 'auto' }}>
          {messages.map((msg, index) => (
            <ListItem key={index}>
              <ListItemText primary={msg} />
            </ListItem>
          ))}
          <div ref={chatEndRef} />
        </List>

        {/* Поле ввода сообщения */}
        <TextField
          fullWidth
          label="Type your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          style={{ marginBottom: '20px' }}
        />
        <Button
            variant="contained"
            color="primary"
            onClick={handleSend}
            style={{ marginBottom: '10px' }}
            >
          Send
        </Button>
      </Container>
    </>
  );
};

export default Chat;
