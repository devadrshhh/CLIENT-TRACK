const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../Model/User');

const generateToken = (id) => {
  return jwt.sign({ id }, 'super_secret_for_client_track_1234!!', { expiresIn: '30d' });
};

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (user && user.password === password) {
      if(user.role === 'staff' && user.staffStatus === 'disabled') {
        return res.status(403).json({ message: 'Staff account disabled' });
      }
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        whatsappTemplate: user.whatsappTemplate,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
