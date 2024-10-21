import React, { useState, useEffect, useRef } from 'react';
import { TextField, Container, ListItem, ListItemText, Box, Typography, Drawer, List, ListItemButton, IconButton, InputAdornment } from '@mui/material';
import { Send as SendIcon, Menu as MenuIcon, Chat as ChatIcon } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars-2';

interface Message {
  text: string;
  sender: 'client' | 'server';
}

const token = localStorage.getItem('authToken');
const socket = io('http://localhost:4000', {
  query: {
    token: token ? `Bearer ${token}` : ''
  }
});

const drawerWidth = 240;
const collapsedDrawerWidth = 70;

const Chat: React.FC = () => {
  const [message, setMessage] = useState(''); // Текущее сообщение
  const [messages, setMessages] = useState<Message[]>([]); // История сообщений
  const [selectedChat, setSelectedChat] = useState<string | null>('General'); // Текущий выбранный чат
  const [chatList, setChatList] = useState<string[]>(['General', 'Work', 'Hobbies']); // Пример списка чатов
  const [error, setError] = useState<string | null>(null); // Для обработки ошибок
  const [drawerOpen, setDrawerOpen] = useState(true); // Управление состоянием боковой панели
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement | null>(null); // Для прокрутки к последнему сообщению

  useEffect(() => {
    socket.on('connect', () => {
      console.log('WebSocket connected');
    });

    socket.on('message', (msg: any) => {
      if (typeof msg === 'string') {
        setMessages((prevMessages) => [...prevMessages, { text: msg, sender: 'server' }]);
      } else if (msg.error) {
        setError(msg.error);
      }
    });

    socket.on('error', (err: string) => {
      console.error('Socket error:', err);
      setError('Ошибка подключения. Пожалуйста, войдите заново.');
      localStorage.removeItem('authToken');
      navigate('/');
    });

    return () => {
      socket.off('message');
      socket.off('error');
    };
  }, [navigate]);

  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = () => {
    const token = localStorage.getItem('authToken');
    if (message.trim()) {
      socket.emit('message', { text: message, token, chat: selectedChat });
      setMessages((prevMessages) => [...prevMessages, { text: message, sender: 'client' }]);
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' && e.shiftKey) {
      // Добавляем перенос строки при Shift + Enter
      e.preventDefault();
      setMessage((prevMessage) => prevMessage + '\n');
    } else if (e.key === 'Enter') {
      // Отправляем сообщение при нажатии только Enter
      e.preventDefault();
      handleSend();
    }
  };
  
  

  const handleKeyPress = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleChatSelect = (chatName: string) => {
    setSelectedChat(chatName);
    setMessages([]); // Очищаем сообщения при смене чата
  };

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <>
      {/* Navbar всегда отображается вверху */}
      <Navbar title="Chat" setIsAuthenticated={() => {}} />

      <Box sx={{ display: 'flex', height: '100vh' }}>
        {/* Левая боковая панель */}
        <Drawer
          variant="permanent"
          sx={{
            width: drawerOpen ? drawerWidth : collapsedDrawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerOpen ? drawerWidth : collapsedDrawerWidth,
              boxSizing: 'border-box',
              top: '64px',
              transition: 'width 0.3s',
            },
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '10px' }}>
            <IconButton onClick={toggleDrawer}>
              <MenuIcon />
            </IconButton>
          </Box>

          <List>
            {chatList.map((chatName) => (
              <ListItemButton
                key={chatName}
                onClick={() => handleChatSelect(chatName)}
                selected={selectedChat === chatName}
                sx={{
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  paddingLeft: drawerOpen ? '20px' : '8px',
                }}
              >
                <ChatIcon sx={{ marginRight: drawerOpen ? '10px' : '0' }} />
                {drawerOpen && <ListItemText primary={chatName} />}
              </ListItemButton>
            ))}
          </List>
        </Drawer>

        {/* Правая часть с чатом */}
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            backgroundColor: '#ffffff',
            paddingTop: '80px',
            paddingLeft: '20px',
            paddingRight: '20px',
          }}
        >
          {/* Сообщения выбранного чата */}
          <Scrollbars
            style={{ height: '100%' }}
            autoHide
            autoHideTimeout={1000}
            autoHideDuration={200}
            thumbMinSize={30}
            universal={true}
            hideTracksWhenNotNeeded={true}
            renderThumbVertical={({ style, ...props }) => (
              <div
                {...props}
                style={{
                  ...style,
                  backgroundColor: '#1976d2', // Синий цвет ползунка
                  borderRadius: '4px',
                }}
              />
            )}
            renderTrackVertical={({ style, ...props }) => (
              <div
                {...props}
                style={{
                  ...style,
                  right: '2px',
                  bottom: '2px',
                  top: '2px',
                  borderRadius: '3px',
                }}
              />
            )}
            renderView={props => (
                <div {...props} style={{ ...props.style, overflowX: 'hidden' }} />
            )}
            renderTrackHorizontal={props => <div {...props} style={{display: 'none'}} className="track-horizontal"/>} // Скрываем горизонтальную прокрутку
          >

          <Box
            sx={{
              flexGrow: 1,
              overflowY: 'auto',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              borderRadius: '8px',
              marginBottom: '10px',
            }}
            >
            {messages.length > 0 ? (
              messages.map((msg, index) => (
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
                    }}
                    >
                    <ListItemText primary={msg.text} />
                  </Box>
                </ListItem>
              ))
            ) : (
              <Typography variant="h6" sx={{ textAlign: 'center', marginTop: '20px' }}>
                No messages in {selectedChat} yet.
              </Typography>
            )}
            <div ref={chatEndRef} />
          </Box>
          </Scrollbars>

          {/* Ввод сообщения с закругленным полем и темным фоном */}
          <Box
            sx={{
              padding: '10px 0', 
              position: 'sticky',
              bottom: 0,
              width: '60%',
              backgroundColor: '#ffffff',
              margin: '0 auto',
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <TextField
              fullWidth
              value={message}
              multiline
              minRows={1} // Минимальное количество строк — 1
              maxRows={6} // Максимальное количество строк — 6
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown} // Обработчик клавиш
              sx={{
                marginBottom: '10px',
                backgroundColor: '#e0e0e0', // Темнее фон
                borderRadius: '20px', // Закругленные углы
                padding: '5px 10px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: 'none', // Убираем рамку
                  },
                },
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleSend} color="primary">
                      <SendIcon /> {/* Иконка отправки */}
                    </IconButton>
                  </InputAdornment>
                ),
                style: {
                  border: 'none', // Убираем внутренние рамки текста
                  outline: 'none', // Убираем фокусную рамку
                  padding: '5px 10px',
                  overflow: 'auto', // Автоматическая прокрутка при превышении maxRows
                },
              }}
              InputLabelProps={{
                style: {
                  display: 'none', // Убираем label внутри поля ввода
                },
              }}
            />
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Chat;
