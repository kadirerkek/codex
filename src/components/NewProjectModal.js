'use client';

import { useState } from 'react';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import {
  Modal,
  Box,
  TextField,
  Button,
  Typography,
} from '@mui/material';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default function NewProjectModal({ open, handleClose }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      await addDoc(collection(db, 'projects'), {
        name,
        description,
        status: 'Active',
        assignedTo: [],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      handleClose();
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <Box sx={style}>
        <Typography variant="h6" component="h2">
          Create New Project
        </Typography>
        {error && <p className="text-red-500">{error}</p>}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <TextField
            label="Project Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Project Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            fullWidth
            multiline
            rows={4}
            required
          />
          <Button type="submit" variant="contained" className="w-full">
            Create Project
          </Button>
        </form>
      </Box>
    </Modal>
  );
}
