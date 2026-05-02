import React, { useState, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, CircularProgress } from '@mui/material';
import { CheckCircle, Dashboard } from '@mui/icons-material';

export default function PaymentMock() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const handleGoToDashboard = async () => {
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/client/pay', {}, getHeaders());
      navigate('/client');
    } catch (err) {
      console.error(err);
      alert('Error finalizing payment. Please try again.');
      setLoading(false);
    }
  };

  const today = new Date();
  const nextMonth = new Date();
  nextMonth.setDate(nextMonth.getDate() + 30);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
        <CheckCircle color="success" sx={{ fontSize: 80, mb: 2 }} />
        <Typography variant="h4" fontWeight="bold" gutterBottom>Payment Completed</Typography>
        
        <Box sx={{ my: 4, p: 3, bgcolor: 'rgba(0, 128, 0, 0.05)', borderRadius: 2 }}>
          <Typography variant="body1" mb={1}>
            Your payment was successful. Your account validity has been extended.
          </Typography>
          <Typography variant="h6" color="primary">
            Validity: {today.toLocaleDateString()} to {nextMonth.toLocaleDateString()}
          </Typography>
        </Box>

        <Button 
          variant="contained" 
          color="primary" 
          size="large" 
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <Dashboard />}
          onClick={handleGoToDashboard}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Updating Details...' : 'Go to Dashboard'}
        </Button>
      </Paper>
    </Container>
  );
}
