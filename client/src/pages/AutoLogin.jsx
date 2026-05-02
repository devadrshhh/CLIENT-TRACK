import React, { useEffect, useContext, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../AuthContext';
import { Container, Typography, Box, CircularProgress } from '@mui/material';

export default function AutoLogin() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { loginDirect } = useContext(AuthContext);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      axios.post('http://localhost:5000/api/auth/magiclogin', { token })
        .then(res => {
          loginDirect(res.data);
          navigate('/client');
        })
        .catch(err => {
          setError('Invalid or expired login link.');
          setTimeout(() => navigate('/'), 3000);
        });
    } else {
      navigate('/');
    }
  }, [searchParams, navigate, loginDirect]);

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Box p={4} bgcolor="white" borderRadius={2} boxShadow={3}>
        {error ? (
          <Typography color="error" variant="h6">{error}</Typography>
        ) : (
          <>
            <CircularProgress size={60} thickness={4} sx={{ mb: 3 }} />
            <Typography variant="h5" fontWeight="bold">Securely Logging You In...</Typography>
            <Typography variant="body1" color="text.secondary" mt={1}>Please wait while we verify your secure token.</Typography>
          </>
        )}
      </Box>
    </Container>
  );
}
