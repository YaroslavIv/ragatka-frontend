import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button, Container, Box } from '@mui/material';
import axios from 'axios';
import Navbar from '../components/Navbar'; // Импортируем Navbar

const Upload: React.FC = () => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

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
    const formData = new FormData();
    selectedFiles.forEach((file) => {
      formData.append('files', file);
    });

    try {
      await axios.post('http://localhost:5000/api/upload', formData);
      alert('Files uploaded successfully');
      setSelectedFiles([]); // Очищаем список файлов после успешной загрузки
    } catch (error) {
      console.error('Error uploading files:', error);
    }
  };

  // Обработчик отмены выбора файлов
  const handleClearFiles = () => {
    setSelectedFiles([]); // Сбрасываем список выбранных файлов
  };

  return (
    <>
      <Navbar title="Upload" />

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
      </Container>
    </>
  );
};

export default Upload;
