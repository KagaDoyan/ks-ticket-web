import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';

export interface ExtendedFile extends File {
  preview: string;
}

interface ImageUploadProps {
  onUpload: (files: ExtendedFile[]) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload }) => {
  const [files, setFiles] = useState<ExtendedFile[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle file drop
  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    onDrop: acceptedFiles => {
      const newFiles = acceptedFiles.map(file =>
        Object.assign(file, {
          preview: URL.createObjectURL(file)
        })
      ) as ExtendedFile[];
      setFiles(currentFiles => [...currentFiles, ...newFiles]);
      onUpload([...files, ...newFiles]);
    }
  });

  // Open file dialog
  const openFileDialog = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  // Remove file
  const removeFile = (file: ExtendedFile) => {
    const newFiles = files.filter(f => f !== file);
    setFiles(newFiles);
    onUpload(newFiles);
  };

  // Preview images
  const thumbs = files.map(file => (
    <Box key={file.name} sx={{ display: 'inline-flex', borderRadius: 2, border: 1, borderColor: 'grey.400', m: 1, position: 'relative' }}>
      <Box sx={{ display: 'flex', minWidth: 0, overflow: 'hidden', width: 100, height: 100 }}>
        <img src={file.preview} alt={file.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>
      <IconButton
        onClick={() => removeFile(file)}
        sx={{ position: 'absolute', top: 0, right: 0, p: 0.5, color: 'white', backgroundColor: 'rgba(0, 0, 0, 0.5)', borderRadius: '50%' }}
      >
        <CloseIcon />
      </IconButton>
    </Box>
  ));

  // Clean up previews
  useEffect(() => {
    return () => {
      files.forEach(file => URL.revokeObjectURL(file.preview));
    };
  }, [files]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed grey',
          padding: '20px',
          textAlign: 'center',
          borderRadius: '4px',
          backgroundColor: '#f9f9f9',
          cursor: 'pointer',
          mb: 2 // Margin bottom to separate from thumbnails
        }}
      >
        <input {...getInputProps()} ref={inputRef} style={{ display: 'none' }} />
        <Typography variant="h6" gutterBottom>
          Drag 'n' drop some files here, or click the button to select files
        </Typography>
        <Button variant="contained" color="primary" onClick={openFileDialog}>
          <CloudUploadIcon sx={{ mr: 1 }} /> Upload Files
        </Button>
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {thumbs}
      </Box>
    </Box>
  );
};

export default ImageUpload;
