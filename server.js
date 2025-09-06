require('dotenv').config({ path: './config.env' });
const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB, isMongoConnected, FileStorage } = require('./config/database');
const bcrypt = require('bcrypt');

// Import routes
const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const galleryRoutes = require('./routes/galleryRoutes');

const app = express();
// Serve frontend files
app.use(express.static(path.join(__dirname, 'public')));

const PORT = process.env.PORT || 5000;

// Database will be connected in startServer()

// Middleware
// Robust CORS configuration: allow multiple env URLs, localhost/127.0.0.1 on any port, and handle preflight
const envFrontendUrlsRaw = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || '')
  .split(',')
  .map((u) => u && u.trim())
  .filter(Boolean);

const defaultAllowedOrigins = [
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://0.0.0.0:3000',
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:5500'
];

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envFrontendUrlsRaw]));

const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin like curl or same-origin
    if (!origin) return callback(null, true);

    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\\d+)?$/.test(origin);

    if (allowedOrigins.includes(origin) || isLocalhost) {
      return callback(null, true);
    }

    return callback(new Error(`CORS: Origin not allowed -> ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'Content-Type']
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/admin', authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/gallery', galleryRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Golden Bean API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Golden Bean API',
    version: '1.0.0',
    endpoints: {
      menu: '/api/menu',
      admin: '/api/admin',
      health: '/api/health'
    }
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// First-time admin setup
const createDefaultAdmin = async () => {
  try {
    if (isMongoConnected()) {
      const Admin = require('./models/Admin');
      const adminCount = await Admin.countDocuments();
      
      if (adminCount === 0) {
        const defaultAdmin = new Admin({
          username: process.env.ADMIN_USERNAME || 'admin',
          email: process.env.ADMIN_EMAIL || 'admin@culinarycanvas.com',
          password: process.env.ADMIN_PASSWORD || 'admin123',
          role: 'super-admin'
        });
        
        await defaultAdmin.save();
        
        console.log('🔐 Default admin created successfully in MongoDB!');
        console.log(`   Username: ${defaultAdmin.username}`);
        console.log(`   Email: ${defaultAdmin.email}`);
        console.log('   ⚠️  Please change the default password after first login!');
        console.log('');
      } else {
        console.log('✅ Admin user(s) already exist in MongoDB database');
      }
    } else {
      // File storage setup
      const adminStorage = new FileStorage('admins.json');
      const existingAdmins = adminStorage.find();
      
      if (existingAdmins.length === 0) {
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10);
        
        const defaultAdmin = {
          username: process.env.ADMIN_USERNAME || 'admin',
          email: process.env.ADMIN_EMAIL || 'admin@culinarycanvas.com',
          password: hashedPassword,
          role: 'super-admin'
        };
        
        adminStorage.create(defaultAdmin);
        
        console.log('🔐 Default admin created successfully (File Storage)!');
        console.log(`   Username: ${defaultAdmin.username}`);
        console.log(`   Email: ${defaultAdmin.email}`);
        console.log('   ⚠️  Please change the default password after first login!');
        console.log('');
      } else {
        console.log('✅ Admin user(s) already exist in file storage');
      }
    }
  } catch (error) {
    console.error('❌ Error creating default admin:', error.message);
  }
};

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    
    // Then create default admin based on actual connection
    await createDefaultAdmin();
    
    app.listen(PORT, () => {
      console.log('🚀 The Culinary Canvas API Server Started!');
      console.log(`   Server running on: http://localhost:${PORT}`);
      console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   Storage: ${isMongoConnected() ? 'MongoDB Database' : 'Local File Storage'}`);
      console.log('');
      console.log('📋 Available endpoints:');
      console.log(`   Health check: http://localhost:${PORT}/api/health`);
      console.log(`   Menu API: http://localhost:${PORT}/api/menu`);
      console.log(`   Gallery API: http://localhost:${PORT}/api/gallery`);
      console.log(`   Admin API: http://localhost:${PORT}/api/admin`);
      console.log('');
      console.log('🎯 Ready for frontend connection!');
      console.log('');
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error('Unhandled Promise Rejection:', err.message);
  // Close server & exit process
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  console.log('Shutting down...');
  process.exit(1);
});

module.exports = app;

