import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import { motion } from 'framer-motion';
import { Container, Paper, Typography, TextField, Button, Box, Alert } from '@mui/material';
import LoginIcon from '@mui/icons-material/Login';

export default function Login() {
  const { login } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ height: '80vh', display: 'flex', alignItems: 'center' }}>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%' }}
      >
        <Paper elevation={4} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom>
            Client Track
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Sign in to continue
          </Typography>

          {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Email Address"
              type="email"
              variant="outlined"
              fullWidth
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <TextField
              label="Password"
              type="password"
              variant="outlined"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <Button 
              type="submit" 
              variant="contained" 
              color="primary" 
              size="large" 
              fullWidth
              startIcon={<LoginIcon />}
              sx={{ mt: 1 }}
            >
              Sign In
            </Button>
          </Box>
        </Paper>
      </motion.div>
    </Container>
  );
}
