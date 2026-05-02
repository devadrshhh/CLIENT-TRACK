import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../AuthContext';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Container, Typography, Box, Button, Tabs, Tab, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Grid, Chip, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import { People, Assessment, Settings as SettingsIcon, Logout, Add, Delete, Edit } from '@mui/icons-material';

export default function AdminDashboard() {
  const { user, logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState(0);
  
  const [staffList, setStaffList] = useState([]);
  const [clients, setClients] = useState([]);
  const [history, setHistory] = useState([]);
  
  const [editClientModal, setEditClientModal] = useState(false);
  const [editClient, setEditClient] = useState({ id: '', name: '', email: '', password: '', amountDue: '' });
  
  const [newStaff, setNewStaff] = useState({ name: '', email: '', password: '' });

  const getHeaders = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const fetchData = async () => {
    try {
      const [staffRes, clientsRes, historyRes] = await Promise.all([
        axios.get('http://localhost:5000/api/admin/staff', getHeaders()),
        axios.get('http://localhost:5000/api/admin/clients', getHeaders()),
        axios.get('http://localhost:5000/api/admin/history', getHeaders())
      ]);
      setStaffList(staffRes.data);
      setClients(clientsRes.data);
      setHistory(historyRes.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAddStaff = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/staff', newStaff, getHeaders());
      setNewStaff({ name: '', email: '', password: '' });
      fetchData();
    } catch (err) { alert('Error adding staff'); }
  };

  const toggleStaffStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'disabled' : 'active';
    await axios.put(`http://localhost:5000/api/admin/staff/${id}/status`, { staffStatus: newStatus }, getHeaders());
    fetchData();
  };

  const deleteStaff = async (id) => {
    if(window.confirm('Remove staff member completely?')) {
      await axios.delete(`http://localhost:5000/api/admin/staff/${id}`, getHeaders());
      fetchData();
    }
  };

  const updateTemplate = async (id, currentTemplate) => {
    const defaultTpl = 'Hello {ClientName}, your payment of {amount} for {Particular} is currently pending. Please complete it here: {paymentlink}';
    const tpl = window.prompt("Update WhatsApp Template for this staff:", currentTemplate || defaultTpl);
    if(tpl) {
      await axios.put(`http://localhost:5000/api/admin/staff/${id}/template`, { whatsappTemplate: tpl }, getHeaders());
    }
  };

  const handleEditClientSave = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`http://localhost:5000/api/admin/clients/${editClient.id}`, editClient, getHeaders());
      setEditClientModal(false);
      fetchData();
    } catch (err) { alert('Error updating client'); }
  };

  const deleteClient = async (id) => {
    if(window.confirm('Delete this client?')) {
      await axios.delete(`http://localhost:5000/api/admin/clients/${id}`, getHeaders());
      fetchData();
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Box>
          <Typography variant="h4" fontWeight="bold">Admin Dashboard</Typography>
          <Typography variant="body1" color="text.secondary">Welcome back, {user.name}</Typography><br/>
        </Box>
        <Button variant="contained" color="error" startIcon={<Logout />} onClick={logout}>
          Logout
        </Button>
      </Box>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, val) => setActiveTab(val)}>
          <Tab icon={<People />} label="Staff Mgmt" iconPosition="start" />
          <Tab icon={<People />} label="All Clients" iconPosition="start" />
          <Tab icon={<Assessment />} label="Global History" iconPosition="start" />
          <Tab icon={<SettingsIcon />} label="Triggers" iconPosition="start" />
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
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>Add New Staff</Typography><br/>
                  <Box component="form" onSubmit={handleAddStaff} display="flex" flexDirection="column" gap={2}>
                    <TextField label="Full Name" value={newStaff.name} onChange={e=>setNewStaff({...newStaff, name: e.target.value})} required fullWidth /> 
                  <br/><br/>
                    <TextField label="Email Address" type="email" value={newStaff.email} onChange={e=>setNewStaff({...newStaff, email: e.target.value})} required fullWidth />
                      <br/><br/>
                    <TextField label="Temporary Password" type="password" value={newStaff.password} onChange={e=>setNewStaff({...newStaff, password: e.target.value})} required fullWidth />
                      <br/><br/>
                    <Button type="submit" variant="contained" color="secondary" startIcon={<Add />}>Create Account</Button>
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3, maxHeight: '600px', overflowY: 'auto' }}>
                  <Typography variant="h6" fontWeight="bold" mb={3}>Current Staff</Typography>
                  {staffList.map(s => (
                    <Paper key={s._id} variant="outlined" sx={{ p: 2, mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box>
                        <Box display="flex" alignItems="center" gap={1} mb={0.5}>
                          <Typography variant="subtitle1" fontWeight="bold">{s.name}</Typography>
                          <Chip label={s.staffStatus} color={s.staffStatus === 'active' ? 'success' : 'warning'} size="small" />
                        </Box>
                        <Typography variant="body2" color="text.secondary">{s.email}</Typography>
                      </Box>
                      <Box display="flex" gap={1}>
                        <Button variant="outlined" size="small" onClick={() => toggleStaffStatus(s._id, s.staffStatus)}>
                          {s.staffStatus === 'active' ? 'Disable' : 'Enable'}
                        </Button>
                        <Button variant="contained" color="error" size="small" onClick={() => deleteStaff(s._id)} sx={{ minWidth: '40px', p: '6px' }}>
                          <Delete fontSize="small" />
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
              <Typography variant="h6" fontWeight="bold" mb={3}>Global Client Directory</Typography>
              <Grid container spacing={3}>
                {clients.map(c => (
                  <Grid item xs={12} sm={6} md={4} key={c._id}>
                    <Paper variant="outlined" sx={{ p: 3 }}>
                      <Typography variant="h6">{c.name}</Typography>
                      <Typography variant="body2" color="text.secondary" mb={2}>Managed by: {staffList.find(s => s._id === c.assignedStaff)?.name || 'Unknown'}</Typography>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Chip label={c.paymentStatus} color={c.paymentStatus === 'paid' ? 'success' : 'warning'} size="small" />
                        <Typography variant="caption">Validity: {new Date(c.validityEnd).toLocaleDateString()}</Typography>
                      </Box>
                      <Box display="flex" gap={1} mt={2}>
                        <Button variant="outlined" size="small" onClick={() => {
                          setEditClient({ id: c._id, name: c.name, email: c.email, password: '', amountDue: c.amountDue || '' });
                          setEditClientModal(true);
                        }} sx={{ flex: 1 }}>
                          Edit
                        </Button>
                        <Button variant="contained" color="error" size="small" onClick={() => deleteClient(c._id)} sx={{ flex: 1 }}>
                          Delete
                        </Button>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          )}

          {activeTab === 2 && (
            <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
              <Typography variant="h6" fontWeight="bold" p={3}>Activity Ledger</Typography>
              <Table stickyHeader>
                <TableHead>
                  <TableRow>
                    <TableCell>Date & Time</TableCell>
                    <TableCell>Paid By</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {history.map(h => (
                    <TableRow key={h._id}>
                      <TableCell sx={{ color: 'text.secondary' }}>{new Date(h.date).toLocaleString()}</TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{h.staffName || 'Unknown'}</TableCell>
                      <TableCell>{h.action}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}

          {activeTab === 3 && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight="bold" mb={1}>WhatsApp Templates Configurations</Typography>
              <Typography variant="body2" color="text.secondary" mb={4}>
                Define specific automated messages for your staff to send. Legend: {"{ClientName}"}, {"{Particular}"}, {"{amount}"}, {"{paymentlink}"}
              </Typography>
              
              {staffList.map(s => (
                <Paper key={s._id} variant="outlined" sx={{ p: 3, mb: 3 }}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography variant="subtitle1" fontWeight="bold">{s.name}'s Template</Typography>
                    <Button variant="outlined" startIcon={<Edit />} onClick={() => updateTemplate(s._id, s.whatsappTemplate)}>
                      Edit Template
                    </Button>
                  </Box>
                  <Box sx={{ p: 2, bgcolor: 'rgba(0,0,0,0.04)', borderRadius: 1 }}>
                    <Typography variant="body2" sx={{ color: 'primary.main', fontStyle: 'italic' }}>
                      {s.whatsappTemplate}
                    </Typography>
                  </Box>
                </Paper>
              ))}
            </Paper>
          )}
        </motion.div>
      </AnimatePresence>

      <Dialog open={editClientModal} onClose={() => setEditClientModal(false)}>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          <Box component="form" id="edit-client-form-admin" onSubmit={handleEditClientSave} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2, minWidth: '300px' }}>
            <TextField label="Name" value={editClient.name} onChange={e=>setEditClient({...editClient, name: e.target.value})} required fullWidth />
            <TextField label="Email" type="email" value={editClient.email} onChange={e=>setEditClient({...editClient, email: e.target.value})} required fullWidth />
            <TextField label="New Password (leave blank to keep current)" type="password" value={editClient.password} onChange={e=>setEditClient({...editClient, password: e.target.value})} fullWidth />
            <TextField label="Amount Due" type="number" value={editClient.amountDue} onChange={e=>setEditClient({...editClient, amountDue: e.target.value})} required fullWidth />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditClientModal(false)}>Cancel</Button>
          <Button type="submit" form="edit-client-form-admin" variant="contained">Save Changes</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
