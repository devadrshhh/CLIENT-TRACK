const express = require('express');
const cors = require('cors');
require('./connection');
const User = require('./Model/User');

const app = express();

app.use(cors());
app.use(express.json());

// Default admin seeder
const seedAdmin = async () => {
  try {
    const adminExists = await User.findOne({ role: 'admin', email: 'admin@system.com' });
    if (!adminExists) {
      await User.create({
        name: 'System Admin',
        email: 'admin@system.com',
        password: '123456',
        role: 'admin'
      });
      console.log('Seeded default admin account');
    }
  } catch (error) {
    console.error('Error seeding admin', error);
  }
};
seedAdmin();

// Routes
app.use('/api/auth', require('./routes/authRoute'));
app.use('/api/admin', require('./routes/adminRoute'));
app.use('/api/staff', require('./routes/staffRoute'));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
