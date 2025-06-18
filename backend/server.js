const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs'); 
const jwt = require('jsonwebtoken'); 
const { PrismaClient } = require('@prisma/client'); 
require('dotenv').config(); 

const app = express();
const prisma = new PrismaClient();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

const authRoute = require('./routes/auth');
app.use('/api/auth', authRoute); 

const farmerRoutes = require('./routes/farmers');
app.use('/farmers', farmerRoutes);

const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const farmRoutes = require("./routes/farms")
app.use('/farms', farmRoutes);

const cropRoutes = require('./routes/crops');
app.use('/crops', cropRoutes);

const equipmentRoutes = require('./routes/equipment');
app.use('/equipment', equipmentRoutes);

const salesRoutes = require('./routes/sales');
app.use('/sales', salesRoutes);

const fertilizationRoutes = require('./routes/fertilization');
app.use('/fertilization', fertilizationRoutes);

const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_secret_key_for_jwt_development';

app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Email-ka ama password-ka khalad ah' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: 'Email-ka ama password-ka khalad ah' });

    const token = jwt.sign(
      { userId: user.id.toString() }, // 👉 HALKAN KA SAAX
      process.env.JWT_SECRET || 'your_secret_key_for_jwt_development',
      { expiresIn: '365d' }
    );

    res.json({ token, message: 'Login-ku wuu guuleystay!' });
  } catch (err) {
    console.error('Login Error:', err);
    res.status(500).json({ error: 'Wuxuu khalad ka yimid server-ka' });
  }
});

app.use(cors({
  origin: 'http://localhost:3000', // Allow your React app's origin
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.listen(PORT, () => console.log(`🚀 Server-ku wuxuu ka shaqeynayaa port ${PORT}`));

