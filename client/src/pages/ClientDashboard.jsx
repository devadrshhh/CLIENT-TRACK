import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Typography, Box, Button, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Chip } from '@mui/material';
import { Logout, Payment } from '@mui/icons-material';

const RazorpayButton = () => {
  const formRef = React.useRef(null);

  useEffect(() => {
    if (formRef.current && formRef.current.children.length === 0) {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/payment-button.js';
      script.setAttribute('data-payment_button_id', 'pl_SkZhaYQ95DDQg0');
      script.async = true;
      formRef.current.appendChild(script);
    }
  }, []);

  return <form ref={formRef} style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}></form>;
};

export default function ClientDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [client, setClient] = useState(null);
  const navigate = useNavigate();

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const fetchData = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/client/me', getHeaders());
      setClient(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (!client) {
    return <Container><Typography sx={{ mt: 4 }}>Loading...</Typography></Container>;
  }

  const isPending = client.paymentStatus === 'pending' || new Date(client.validityEnd) < new Date();

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Client Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">Welcome back, {client.name}</Typography>
        </Box>
        <Button variant="contained" color="error" startIcon={<Logout />} onClick={logout}>
          Logout
        </Button>
      </Box>
<br /><br />
      <Grid container spacing={4}>
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Account Overview</Typography>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">Email</Typography>
              <Typography variant="body1">{client.email}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">Phone</Typography>
              <Typography variant="body1">{client.phone}</Typography>
            </Box>
            <Box mb={2}>
              <Typography variant="body2" color="text.secondary">Validity Status</Typography>
              <Box display="flex" alignItems="center" gap={1} mt={0.5}>
                <Typography variant="body1">
                  {new Date(client.validityStart).toLocaleDateString()} - {new Date(client.validityEnd).toLocaleDateString()}
                </Typography>
                <Chip label={isPending ? 'Expired/Pending' : 'Active'} color={isPending ? 'error' : 'success'} size="small" />
              </Box>
            </Box>
            <Box>
              <Typography variant="body2" color="text.secondary">Amount Due</Typography>
              <Typography variant="h6" color="primary">₹{client.amountDue || 0}</Typography>
            </Box>
            
            <Box mt={3} display="flex" justifyContent="center">
              <RazorpayButton />
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" fontWeight="bold" mb={2}>Payment History</Typography>
            {client.paymentHistory && client.paymentHistory.length > 0 ? (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Particular</TableCell>
                      <TableCell>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {client.paymentHistory.map((ph, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{ph.date ? new Date(ph.date).toLocaleDateString() : 'N/A'}</TableCell>
                        <TableCell>{ph.particular}</TableCell>
                        <TableCell>₹{ph.amount}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Typography variant="body2" color="text.secondary">No payment history available.</Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}
