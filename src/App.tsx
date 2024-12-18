import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import Chat from './pages/Chat';
import Upload from './pages/Upload';
import Login from './pages/Login';
import Account from './pages/Account'; 
import ProtectedRoute from './components/ProtectedRoute';
import { Button } from '@mui/material';
import Navbar from './components/Navbar';

const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    background: {
      default: '#f4f6f8',
      paper: '#fff',
      server: '#e0e0e0',
      client: '#1976d2',
    },
    text: { 
      primary: '#000', 
      secondary: '#555',
      server: '#333333',
      client: '#fff',
    },
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#90caf9' },
    background: {
      default: '#121212',
      paper: '#1e1e1e',
      server: '#333333',
      client: '#444444',
    },
    text: { 
      primary: '#fff', 
      secondary: '#aaa',
      server: '#fff',
      client: '#fff',
    },
  },
});


const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#ff4081',
    },
    background: {
      default: '#f4f6f8',
    },
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif',
    h4: {
      fontSize: '2rem',
      fontWeight: 'bold',
    },
    body1: {
      fontSize: '1rem',
    },
  },
});

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(true);


  // Проверка аутентификации при загрузке
  useEffect(() => {
    const token = localStorage.getItem('authToken'); // Проверяем, есть ли токен
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <ThemeProvider theme={isDarkMode ? darkTheme : lightTheme}>
  <CssBaseline />
  <Router>
    <Routes>
      <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
      <Route
        path="/chat"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Chat setIsAuthenticated={setIsAuthenticated} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/upload"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Upload isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/account"
        element={
          <ProtectedRoute isAuthenticated={isAuthenticated}>
            <Account setIsAuthenticated={setIsAuthenticated} isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode} />
          </ProtectedRoute>
        }
      />
    </Routes>
    <Button onClick={() => setIsDarkMode(!isDarkMode)}>
      Toggle {isDarkMode ? 'Light' : 'Dark'} Theme
    </Button>
  </Router>
</ThemeProvider>

  );
};

export default App;