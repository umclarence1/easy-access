import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors'; // <--- make sure to import this
import authRoutes from './routes/authRoutes.js';

dotenv.config();

const app = express(); // ✅ Define app before using it
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // ✅ Now this works
app.use(express.json());

app.get('/ping', (req, res) => {
  res.send('pong');
});


// Routes
app.use('/api/auth', authRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(5000, () => {
      console.log('🚀 Server running on port 5000');
    });
  });