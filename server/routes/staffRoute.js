const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Client = require('../Model/Client');
const History = require('../Model/History');
const User = require('../Model/User');
const jwt = require('jsonwebtoken');

const logHistory = async (req, staffId, action) => {
  await History.create({ staffId, staffName: req.user.name, action });
};

router.post('/clients', protect, async (req, res) => {
  const { name, email, phone, personalInfo, paymentStatus, password, amountDue } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    await User.create({
      name,
      email,
      password,
      role: 'client'
    });

    const client = await Client.create({
      name, email, phone, personalInfo, paymentStatus,
      assignedStaff: req.user._id, amountDue
    });
    await logHistory(req, req.user._id, `Added new client: ${name}`);
    res.status(201).json(client);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/clients', protect, async (req, res) => {
  const clients = await Client.find({ assignedStaff: req.user._id });
  res.json(clients);
});

router.put('/clients/:id', protect, async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, assignedStaff: req.user._id });
  if (client) {
    const oldEmail = client.email;
    const { name, email, password } = req.body;
    
    const userToUpdate = await User.findOne({ email: oldEmail, role: 'client' });
    if (userToUpdate) {
      if (name) userToUpdate.name = name;
      if (email) userToUpdate.email = email;
      if (password) userToUpdate.password = password;
      await userToUpdate.save();
    }
    
    Object.assign(client, req.body);
    const updated = await client.save();
    await logHistory(req, req.user._id, `Updated client info for: ${client.name}`);
    res.json(updated);
  } else {
    res.status(404).json({ message: 'Client not found or unassigned' });
  }
});

router.delete('/clients/:id', protect, async (req, res) => {
  const client = await Client.findOne({ _id: req.params.id, assignedStaff: req.user._id });
  if (client) {
    await client.deleteOne();
    await logHistory(req, req.user._id, `Deleted client: ${client.name}`);
    res.json({ message: 'Client removed' });
  } else {
    res.status(404).json({ message: 'Client not found or unassigned' });
  }
});

router.get('/clients/:id/token', protect, async (req, res) => {
  try {
    const client = await Client.findOne({ _id: req.params.id, assignedStaff: req.user._id });
    if (client) {
      const user = await User.findOne({ email: client.email });
      if (user) {
        const token = jwt.sign({ id: user._id }, 'super_secret_for_client_track_1234!!', { expiresIn: '7d' });
        res.json({ token });
      } else {
        res.status(404).json({ message: 'Associated user not found' });
      }
    } else {
      res.status(404).json({ message: 'Client not found or unassigned' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/clients/:id/payments', protect, async (req, res) => {
  const { amount, particular } = req.body;
  const client = await Client.findOne({ _id: req.params.id, assignedStaff: req.user._id });
  if (client) {
    client.paymentHistory.push({ amount, particular });
    if(client.paymentStatus === 'pending') {
      client.paymentStatus = 'paid'; // simplify assumption for demo
    }
    await client.save();
    await logHistory(req, req.user._id, `Added payment of ${amount} for client: ${client.name}`);
    res.status(201).json(client);
  } else {
    res.status(404).json({ message: 'Client not found' });
  }
});

router.get('/history', protect, async (req, res) => {
  const history = await History.find({ staffId: req.user._id }).sort({ date: -1 });
  res.json(history);
});

module.exports = router;
