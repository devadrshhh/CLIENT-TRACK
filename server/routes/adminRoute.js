const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middlewares/authMiddleware');
const User = require('../Model/User');
const Client = require('../Model/Client');
const History = require('../Model/History');

// Manage Staff
router.post('/staff', protect, admin, async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: 'User already exists' });
    
    const user = await User.create({ name, email, password, role: 'staff' });
    res.status(201).json(user);
  } catch (error) { res.status(500).json({ message: 'Server error' }); }
});

router.get('/staff', protect, admin, async (req, res) => {
  const staff = await User.find({ role: 'staff' }).select('-password');
  res.json(staff);
});

router.put('/staff/:id/status', protect, admin, async (req, res) => {
  const { staffStatus } = req.body;
  const staff = await User.findById(req.params.id);
  if (staff && staff.role === 'staff') {
    staff.staffStatus = staffStatus;
    const updated = await staff.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: 'Staff not found' });
  }
});

router.put('/staff/:id/template', protect, admin, async (req, res) => {
  const { whatsappTemplate } = req.body;
  const staff = await User.findById(req.params.id);
  if (staff && staff.role === 'staff') {
    staff.whatsappTemplate = whatsappTemplate;
    const updated = await staff.save();
    res.json(updated);
  } else {
    res.status(404).json({ message: 'Staff not found' });
  }
});

router.delete('/staff/:id', protect, admin, async (req, res) => {
  const staff = await User.findById(req.params.id);
  if (staff && staff.role === 'staff') {
    await staff.deleteOne();
    res.json({ message: 'Staff deleted' });
  } else {
    res.status(404).json({ message: 'Staff not found' });
  }
});

// Admin Globals
router.get('/clients', protect, admin, async (req, res) => {
  const clients = await Client.find({});
  res.json(clients);
});

router.delete('/clients/:id', protect, admin, async (req, res) => {
  const client = await Client.findById(req.params.id);
  if (client) {
    await client.deleteOne();
    await History.create({ staffId: req.user._id, staffName: req.user.name, action: `Admin deleted client: ${client.name}` });
    res.json({ message: 'Client removed' });
  } else {
    res.status(404).json({ message: 'Client not found' });
  }
});

router.get('/history', protect, admin, async (req, res) => {
  const history = await History.find({}).sort({ date: -1 });
  res.json(history);
});

module.exports = router;
