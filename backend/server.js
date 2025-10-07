const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');
const fs = require('fs');
const path = require('path');

const authRoutes = require('./routes/authRoutes');
const agentRoutes = require('./routes/agentRoutes');
const leadRoutes = require('./routes/leadRoutes');

dotenv.config();

connectDB();

const app = express();

// 1. CORS Middleware 
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));

// 2. Body Parser Middleware 
app.use(express.json());  
app.use(express.urlencoded({ extended: true }));  

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}


app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MERN Agent Manager API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      agents: '/api/agents',
      leads: '/api/leads'
    }
  });
});

// Mount routes
app.use('/api/auth', authRoutes);      
app.use('/api/agents', agentRoutes);   
app.use('/api/leads', leadRoutes);     

// ===== ERROR HANDLING =====

app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});


app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Server Error'
  });
});


const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`

      Server is running!               
      Port: ${PORT}                      
      URL: http://localhost:${PORT}     

  `);
});