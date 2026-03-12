const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const path = require('path');

// Load env vars
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow all origins for development
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
const morgan = require('morgan');
app.use(morgan('dev'));
app.use(express.json());

// Serve uploaded profile pictures
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Serve Admin Dashboard (React/Vite) static files
app.use(express.static(path.join(__dirname, '../client-admin/dist')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/analytics', require('./routes/analyticsRoutes'));
app.use('/api/counseling', require('./routes/counselingRoutes'));
app.use('/api/chatbot', require('./routes/chatbotRoutes'));

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// For any other request, send back index.html from the admin dist
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../client-admin/dist', 'index.html'));
});

// Error handling middleware
const { errorHandler } = require('./middleware/errorMiddleware');
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Start server with database connection
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error(`Failed to start server: ${error.message}`);
    console.log('Trying to start with MongoDB Memory Server...');
    
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongoServer = await MongoMemoryServer.create();
      const mongoUri = mongoServer.getUri();
      
      const mongoose = require('mongoose');
      await mongoose.connect(mongoUri);
      console.log('🗄️  Using MongoDB Memory Server');
      
      app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT} with in-memory database`);
      });
    } catch (memServerErr) {
      console.error('Could not start with memory server:', memServerErr.message);
      process.exit(1);
    }
  }
};

startServer();
