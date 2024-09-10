import React, { useState, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Box, Typography, IconButton, Button } from '@mui/material';
import { CloudUpload as CloudUploadIcon, Close as CloseIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';

export interface ExtendedFile extends File {
  preview: string;
}

interface ImageUploadProps {
  onUpload: (files: ExtendedFile[]) => void;
  formdata: any;
  setFormData: (data: any) => void;
}

const ImageUpload: React.FC<ImageUploadProps> = ({ onUpload, formdata, setFormData }) => {
  const [files, setFiles] = useState<ExtendedFile[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<any>([]);
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

  useEffect(() => {
    setUploadedUrls(formdata.ticket_image);
  }, [formdata]);

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

  const deleteFile = (id: number) => {
    Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
      if (result.isConfirmed) {
        setFormData({
          ...formdata,
          delete_images: formdata.delete_images ? [...formdata.delete_images, uploadedUrls.filter((url: any) => url.id === id)[0].name] : [uploadedUrls.filter((url: any) => url.id === id)[0].name],
          ticket_image: uploadedUrls.filter((url: any) => url.id !== id),
        })
      }
    })
  }

  const uploadedThumbnails = uploadedUrls.map((url: any, index: number) => (
    <Box key={url.name} sx={{ display: 'inline-flex', borderRadius: 2, border: 1, borderColor: 'grey.400', m: 1, position: 'relative' }}>
      <Box sx={{ display: 'flex', minWidth: 0, overflow: 'hidden', width: 100, height: 100 }}>
        <img src={process.env.NEXT_PUBLIC_API_URL + url.path} alt={url.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </Box>
      <IconButton
        onClick={() => deleteFile(url.id)}
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

  useEffect(() => {
    if (formdata.uploadedFiles?.length == 0) {
      setFiles([]);
    }
  }, [formdata.uploadedFiles]);


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
          Drag 'n' drop some files here, or click to select files
        </Typography>
        {/* <Button variant="contained" color="primary" onClick={openFileDialog}>
          <CloudUploadIcon sx={{ mr: 1 }} /> Upload Files
        </Button> */}
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
        {thumbs}
      </Box>
      {uploadedUrls.length > 0 && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h6" gutterBottom>
            Uploaded Images:
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
            {uploadedThumbnails}
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default ImageUpload;
