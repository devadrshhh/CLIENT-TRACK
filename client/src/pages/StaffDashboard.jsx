import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Typography, Box, Button, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Grid, Chip } from '@mui/material';
import { People, Warning, Assessment, Logout, Add, Delete, Payment, WhatsApp } from '@mui/icons-material';

export default function StaffDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  
  const [clients, setClients] = useState([]);
  const [history, setHistory] = useState([]);
  
  const [newClient, setNewClient] = useState({
    name: '', email: '', phone: '', personalInfo: '', validityStart: '', validityEnd: '', paymentStatus: 'pending'
  });

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const fetchData = async () => {
    try {
      const [clientsRes, historyRes] = await Promise.all([
        axios.get('http://localhost:5000/api/staff/clients', getHeaders()),
        axios.get('http://localhost:5000/api/staff/history', getHeaders())
      ]);
      setClients(clientsRes.data);
      setHistory(historyRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddClient = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/staff/clients', newClient, getHeaders());
      setNewClient({ name: '', email: '', phone: '', personalInfo: '', validityStart: '', validityEnd: '', paymentStatus: 'pending' });
      fetchData();
    } catch (err) { alert('Error adding client'); }
  };

  const deleteClient = async (id) => {
    if(window.confirm('Delete this client?')) {
      await axios.delete(`http://localhost:5000/api/staff/clients/${id}`, getHeaders());
      fetchData();
    }
  };

  const addPayment = async (id) => {
    const amount = window.prompt("Enter payment amount:");
    const particular = window.prompt("Enter particular (e.g. Registration Fee):");
    if(amount && particular) {
      await axios.post(`http://localhost:5000/api/staff/clients/${id}/payments`, { amount: Number(amount), particular }, getHeaders());
      fetchData();
    }
  };

  const pendingClients = clients.filter(c => new Date(c.validityEnd) < new Date() || c.paymentStatus === 'pending');

  const sendWhatsApp = (client) => {
    const particular = client.paymentHistory?.length > 0 ? client.paymentHistory[client.paymentHistory.length - 1].particular : 'Subscription';
    let text = user.whatsappTemplate || 'Hello {ClientName}, your payment is pending.';
    text = text.replace('{ClientName}', client.name).replace('{Particular}', particular);
    
    const phone = client.phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Staff Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">Hello, {user.name}</Typography>
        </Box>
        <Button variant="contained" color="error" startIcon={<Logout />} onClick={logout}>
          Logout
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab icon={<People />} label="My Clients" iconPosition="start" />
          <Tab icon={<Warning />} label={`Pending Payments (${pendingClients.length})`} iconPosition="start" />
          <Tab icon={<Assessment />} label="My History" iconPosition="start" />
        </Tabs>
      </Box>

      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 0 && (
            <Grid container spacing={4}>
              <Grid item xs={12} md={5}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>Add New Client</Typography>
                  <Box component="form" onSubmit={handleAddClient} display="flex" flexDirection="column" gap={2}>
                    <TextField label="Name" value={newClient.name} onChange={e=>setNewClient({...newClient, name: e.target.value})} required fullWidth />
                    <TextField label="Email" type="email" value={newClient.email} onChange={e=>setNewClient({...newClient, email: e.target.value})} required fullWidth />
                    <TextField label="Phone / WhatsApp" value={newClient.phone} onChange={e=>setNewClient({...newClient, phone: e.target.value})} required fullWidth />
                    <Box display="flex" gap={2}>
                      <TextField label="Validity Start" type="date" InputLabelProps={{ shrink: true }} value={newClient.validityStart} onChange={e=>setNewClient({...newClient, validityStart: e.target.value})} required fullWidth />
                      <TextField label="Validity End" type="date" InputLabelProps={{ shrink: true }} value={newClient.validityEnd} onChange={e=>setNewClient({...newClient, validityEnd: e.target.value})} required fullWidth />
                    </Box>
                    <Button type="submit" variant="contained" color="secondary" startIcon={<Add />} sx={{ mt: 1 }}>Add Client</Button>
                  </Box>
                </Paper>
              </Grid>

              <Grid item xs={12} md={7}>
                <Paper sx={{ p: 3, maxHeight: '600px', overflowY: 'auto' }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>Client Directory</Typography>
                  {clients.map(c => (
                    <Paper key={c._id} variant="outlined" sx={{ p: 3, mb: 2 }}>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                        <Box>
                          <Typography variant="h6">{c.name}</Typography>
                          <Typography variant="body2" color="text.secondary">{c.phone} • {c.email}</Typography>
                        </Box>
                        <Chip label={c.paymentStatus} color={c.paymentStatus === 'paid' ? 'success' : 'warning'} size="small" />
                      </Box>
                      <Box sx={{ p: 1.5, bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 1, mb: 2 }}>
                        <Typography variant="body2">
                          <strong>Validity:</strong> {new Date(c.validityStart).toLocaleDateString()} to {new Date(c.validityEnd).toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Box display="flex" gap={2}>
                        <Button variant="outlined" startIcon={<Payment />} onClick={() => addPayment(c._id)} fullWidth>
                          Add Payment
                        </Button>
                        <Button variant="contained" color="error" onClick={() => deleteClient(c._id)} sx={{ minWidth: '40px', p: '6px' }}>
                          <Delete />
                        </Button>
                      </Box>
                    </Paper>
                  ))}
                </Paper>
              </Grid>
            </Grid>
          )}

          {activeTab === 1 && (
            <Paper sx={{ p: 3 }}>
               <Typography variant="h6" fontWeight="bold" mb={3}>Action Required: Pending & Expired</Typography>
               <Grid container spacing={3}>
                 {pendingClients.map(c => (
                   <Grid item xs={12} sm={6} md={4} key={c._id}>
                     <Paper variant="outlined" sx={{ p: 3, borderColor: 'warning.main', bgcolor: 'rgba(245, 158, 11, 0.05)' }}>
                       <Typography variant="h6" mb={1}>{c.name}</Typography>
                       <Typography variant="body2" color="text.secondary" mb={1}>Phone: {c.phone}</Typography>
                       <Typography variant="body2" color="error" mb={2}>
                         Expired on: {new Date(c.validityEnd).toLocaleDateString()}
                       </Typography>
                       <Button variant="contained" color="success" startIcon={<WhatsApp />} onClick={() => sendWhatsApp(c)} fullWidth>
                         Send Alert
                       </Button>
                     </Paper>
                   </Grid>
                 ))}
                 {pendingClients.length === 0 && (
                   <Typography variant="body1" color="text.secondary" sx={{ p: 2 }}>All clients are up to date! Great job.</Typography>
                 )}
               </Grid>
            </Paper>
          )}

          {activeTab === 2 && (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
               <Typography variant="h6" fontWeight="bold" p={3}>My History</Typography>
               <Table stickyHeader>
                 <TableHead>
                   <TableRow>
                     <TableCell>Date & Time</TableCell>
                     <TableCell>Action Taken</TableCell>
                   </TableRow>
                 </TableHead>
                 <TableBody>
                   {history.map(h => (
                     <TableRow key={h._id}>
                       <TableCell sx={{ color: 'text.secondary' }}>{new Date(h.date).toLocaleString()}</TableCell>
                       <TableCell>{h.action}</TableCell>
                     </TableRow>
                   ))}
                 </TableBody>
               </Table>
            </TableContainer>
          )}
        </motion.div>
      </AnimatePresence>
    </Container>
  );
}
