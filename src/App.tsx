import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Chat from './pages/Chat';
import Upload from './pages/Upload';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute'; // Импортируем защищённый маршрут

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Проверка аутентификации при загрузке
  useEffect(() => {
    const token = localStorage.getItem('authToken'); // Проверяем, есть ли токен
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
        <Route 
          path="/chat" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Chat />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/upload" 
          element={
            <ProtectedRoute isAuthenticated={isAuthenticated}>
              <Upload />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
};

export default App;
