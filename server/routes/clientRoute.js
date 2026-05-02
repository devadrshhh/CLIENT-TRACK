const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/authMiddleware');
const Client = require('../Model/Client');
const User = require('../Model/User');
const History = require('../Model/History');

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const client = await Client.findOne({ email: user.email });
    if(client) {
      res.json(client);
    } else {
      res.status(404).json({ message: 'Client profile not found' });
    }
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/pay', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const client = await Client.findOne({ email: user.email });
    
    if (client) {
      const today = new Date();
      const nextMonth = new Date(today);
      nextMonth.setDate(nextMonth.getDate() + 30);
      
      client.validityStart = today;
      client.validityEnd = nextMonth;
      client.paymentStatus = 'paid';
      
      client.paymentHistory.push({
        amount: client.amountDue || 0,
        particular: 'Online Payment',
        date: new Date()
      });
      
      await client.save();
      
      await History.create({
        staffId: client.assignedStaff,
        staffName: `${client.name} (Client)`,
        action: `Client self-paid online: ₹${client.amountDue || 0}`
      });

      res.json({ message: 'Payment successful', client });
    } else {
      res.status(404).json({ message: 'Client profile not found' });
    }
  } catch(err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
