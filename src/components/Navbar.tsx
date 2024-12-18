import React from 'react';
import { AppBar, Toolbar, Typography, Button, IconButton, Switch } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ChatIcon from '@mui/icons-material/Chat';
import AccountCircleIcon from '@mui/icons-material/AccountCircle'; // Иконка для страницы учетных данных

interface NavbarProps {
  title: string;
  setIsAuthenticated: (authStatus: boolean) => void;
  isDarkMode: boolean;
  setIsDarkMode: (value: boolean) => void;
}

const Navbar: React.FC<NavbarProps> = ({ title, setIsAuthenticated, isDarkMode, setIsDarkMode }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {title}
        </Typography>
        <Button color="inherit" startIcon={<ChatIcon />} component={Link} to="/chat">
          Chat
        </Button>
        <Button color="inherit" startIcon={<CloudUploadIcon />} component={Link} to="/upload">
          Upload
        </Button>
        <Button color="inherit" startIcon={<AccountCircleIcon />} component={Link} to="/account">
          Account
        </Button>
        <Switch
          checked={isDarkMode}
          onChange={(e) => setIsDarkMode(e.target.checked)}
          color="default"
        />
        <IconButton color="inherit" onClick={handleLogout}>
          <ExitToAppIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
