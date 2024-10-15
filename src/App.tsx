import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Chat from './pages/Chat';
import Upload from './pages/Upload';
import Login from './pages/Login';

const App: React.FC = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} /> {/* Страница логина */}
        <Route path="/chat" element={<Chat />} /> {/* Страница чата */}
        <Route path="/upload" element={<Upload />} /> {/* Страница загрузки */}
      </Routes>
    </Router>
  );
};

export default App;
