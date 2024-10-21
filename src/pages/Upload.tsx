import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Container, Box } from '@mui/material';
import axios, { AxiosError } from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; // Импортируем Navbar

const Upload: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null); // Для обработки ошибок
  const navigate = useNavigate(); // Для перенаправления в случае недействительного токена

  // Обработчик для drag-and-drop
  const onDrop = useCallback((acceptedFiles: File[]) => {
    setSelectedFiles((prevFiles) => [...prevFiles, ...acceptedFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  // Обработчик выбора файлов через input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setSelectedFiles((prevFiles) => [...prevFiles, ...Array.from(files)]);
    }
  };

  // Отправка файлов на сервер
  const handleUpload = async () => {
    const token = localStorage.getItem('authToken'); // Получаем токен из localStorage
    if (!token) {
      setError('Token is missing, please log in.');
      return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await axios.post('http://localhost:5001/api/upload', formData, {
        headers: {
          Authorization: `Bearer ${token}`, // Передаем токен в заголовке
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Files uploaded successfully');
      setSelectedFiles([]); // Очищаем список файлов после успешной загрузки
    } catch (err) {
      const axiosError = err as AxiosError;
      console.error('Error uploading files:', axiosError);
      setError('Ошибка при загрузке файлов.');
      if (axiosError.response?.status === 403) {
        // Если токен недействителен, перенаправляем на страницу логина
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        navigate('/');
      }
    }
  };

  // Обработчик отмены выбора файлов
  const handleClearFiles = () => {
    setSelectedFiles([]); // Сбрасываем список выбранных файлов
  };

  return (
    <>
      <Navbar title="Upload" setIsAuthenticated={setIsAuthenticated} />

      <Container maxWidth="sm" style={{ paddingTop: '100px' }}>
        {/* Drag-and-Drop зона */}
        <Box
          {...getRootProps()}
          sx={{
            border: '2px dashed grey',
            borderRadius: '5px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '20px',
            backgroundColor: isDragActive ? '#f0f0f0' : '#fff',
          }}
        >
          <input {...getInputProps()} />
          {isDragActive ? (
            <p>Drop the files here ...</p>
          ) : (
            <p>Drag 'n' drop some files here, or click to select files</p>
          )}
        </Box>

        {/* Выбор файлов через input */}
        <input type="file" multiple onChange={handleFileChange} />

        {/* Список выбранных файлов */}
        <Box mt={2}>
          {selectedFiles.length > 0 && (
            <ul>
              {selectedFiles.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          )}
        </Box>

        {/* Кнопки для отправки и очистки выбранных файлов */}
        <Box mt={2}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleUpload}
            disabled={selectedFiles.length === 0}
            style={{ marginRight: '10px' }}
          >
            Upload
          </Button>
          <Button
            variant="outlined"
            color="secondary"
            onClick={handleClearFiles}
            disabled={selectedFiles.length === 0}
          >
            Clear Selection
          </Button>
        </Box>

        {/* Отображение ошибки */}
        {error && <Box mt={2} color="error.main">{error}</Box>}
      </Container>
    </>
  );
};

export default Upload;
