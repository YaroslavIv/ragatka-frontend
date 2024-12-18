import React, { useState, useEffect, useRef } from 'react';
import { TextField, Container, ListItem, ListItemText, Box, Typography, Drawer, List, ListItemButton, IconButton, InputAdornment, Button } from '@mui/material';
import { Send as SendIcon, Menu as MenuIcon, Chat as ChatIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Navbar from '../components/Navbar';
import io from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import { Scrollbars } from 'react-custom-scrollbars-2';
import axios, { AxiosError } from 'axios'; // Импортируем AxiosError для работы с ошибками
import { useTheme } from '@mui/material/styles';

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

interface AccountProps {
  setIsAuthenticated: (authStatus: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

const Chat: React.FC<AccountProps> = ({ setIsAuthenticated, isDarkMode, setIsDarkMode }) => {
  const [message, setMessage] = useState(''); // Текущее сообщение
  const [messages, setMessages] = useState<Message[]>([]); // История сообщений
  const [selectedChat, setSelectedChat] = useState<string | null>('General'); // Текущий выбранный чат
  const [chatList, setChatList] = useState<string[]>(['General', 'Work']); // Пример списка чатов
  const [error, setError] = useState<string | null>(null); // Для обработки ошибок
  const [drawerOpen, setDrawerOpen] = useState(true); // Управление состоянием боковой панели
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement | null>(null); // Для прокрутки к последнему сообщению
  const [userName, setUserName] = useState<string>(''); // Имя пользователя
  const [loading, setLoading] = useState<boolean>(true); // Для отображения статуса загрузки
  const [newChatName, setNewChatName] = useState<string>(''); // Для создания нового чата
  const theme = useTheme();



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

        const { userName, _ } = response.data;
        setUserName(userName); // Сохраняем имя пользователя
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

  // Создание нового чата
  const handleCreateChat = () => {
    if (newChatName.trim() && !chatList.includes(newChatName)) {
      setChatList([...chatList, newChatName]);
      setNewChatName(''); // Очищаем поле после создания
    }
  };

  // Удаление чата
  const handleDeleteChat = (chatName: string) => {
    if (chatName !== 'General') {
      setChatList(chatList.filter((chat) => chat !== chatName));
      if (selectedChat === chatName) {
        setSelectedChat('General'); // Переключаем на чат "General", если текущий был удалён
      }
    } else {
      alert('You cannot delete the "General" chat.');
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
      <Navbar title="Chat" 
        setIsAuthenticated={() => {}}
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
      />

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
              transition: 'width 0.3s ease-in-out',
              background: 'linear-gradient(135deg, #1976d2, #4fc3f7)',
              color: theme.palette.background.paper,
            },
          }}
        >
          {/* Заголовок и аватар */}
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px' }}>
            {drawerOpen && <Typography variant="body2">{userName}</Typography>}
          </Box>

          {/* Кнопка открытия/закрытия */}
          <Box sx={{ display: 'flex', justifyContent: 'center', padding: '10px' }}>
            <IconButton onClick={toggleDrawer} sx={{ color: theme.palette.background.paper }}>
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Список чатов */}
          <List>
            {chatList.map((chatName) => (
              <ListItemButton
                key={chatName}
                onClick={() => handleChatSelect(chatName)}
                selected={selectedChat === chatName}
                sx={{
                  justifyContent: drawerOpen ? 'initial' : 'center',
                  paddingLeft: drawerOpen ? '20px' : '8px',
                  '&:hover': { backgroundColor: '#115293' },
                }}
              >
                <ChatIcon sx={{ marginRight: drawerOpen ? '10px' : '0', color: theme.palette.background.paper }} />
                {drawerOpen && (
                  <ListItemText
                    primary={chatName}
                    sx={{
                      '& .MuiListItemText-primary': {
                        fontWeight: selectedChat === chatName ? 'bold' : 'normal',
                        color: theme.palette.background.paper,
                      },
                    }}
                  />
                )}
                {drawerOpen && (
                <IconButton onClick={() => handleDeleteChat(chatName)} sx={{ color: theme.palette.background.paper }}>
                  <DeleteIcon />
                </IconButton>
                )}
              </ListItemButton>
            ))}
          </List>

          {/* Добавление нового чата */}
          {drawerOpen && (
          <Box sx={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          <TextField
            label="New Chat"
            value={newChatName}
            onChange={(e) => setNewChatName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateChat(); // Создаем чат по нажатию Enter
              }
            }}
            fullWidth
            variant="outlined"
            sx={{
              marginBottom: '10px',
              backgroundColor: theme.palette.background.paper, // Темнее фон
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  border: 'none', // Убираем рамку
                },
              },
            }}
            InputLabelProps={{
              style: {
                display: 'none', // Убираем label внутри поля ввода
              },
            }}
          />
          <Button onClick={handleCreateChat} variant="contained" sx={{ backgroundColor: '#1976d2', color: theme.palette.background.paper }}>
            Create Chat
          </Button>
        </Box>
        
          )}
        </Drawer>

        {/* Правая часть с чатом */}
        <Container
          maxWidth="lg"
          sx={{
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            backgroundColor: theme.palette.background.paper,
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
                      backgroundColor: msg.sender === 'client' ? theme.palette.background.client : theme.palette.background.server,
                      color: msg.sender === 'client' ? theme.palette.text.client : theme.palette.text.server,
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
              backgroundColor: theme.palette.background.paper,
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
                backgroundColor: theme.palette.background.paper, // Темнее фон
                color: theme.palette.text.primary,
                borderRadius: '20px', // Закругленные углы
                padding: '5px 10px',
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    border: `2px solid ${theme.palette.text.primary}`, // Убираем рамку
                    borderRadius: '20px'
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
