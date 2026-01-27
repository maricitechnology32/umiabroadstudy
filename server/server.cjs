

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const http = require('http');
const { Server } = require("socket.io");
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const path = require('path');
const connectDB = require('./config/db');

// Import Routes
const publicRoutes = require('./routes/publicRoutes');
const universityRoutes = require('./routes/universityRoutes');
const auth = require('./routes/authRoutes');
const consultancies = require('./routes/consultancyRoutes');
const students = require('./routes/studentRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const staffRoutes = require('./routes/staffRoutes');
const holidayRoutes = require('./routes/holidayRoutes');
const eventRoutes = require('./routes/eventRoutes');
const aiRoutes = require('./routes/aiRoutes');
const aboutUsRoutes = require('./routes/aboutUsRoutes');
const blogRoutes = require('./routes/blogRoutes');
const contactSettingsRoutes = require('./routes/contactSettingsRoutes');
const contactMessageRoutes = require('./routes/contactMessageRoutes');
const jobRoutes = require('./routes/jobRoutes');
const jobApplicationRoutes = require('./routes/jobApplicationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const {
    setupSecurityMiddleware,
    enforceHTTPS,
    additionalSecurityHeaders,
    securityLogger,
    apiLimiter
} = require('./middleware/securityMiddleware');

// Load environment variables - always load .env
dotenv.config();

// Set NODE_ENV if not set
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

connectDB();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';
const server = http.createServer(app);

// ============================================
// TRUST PROXY (Required for cPanel/reverse proxy)
// ============================================
app.set('trust proxy', 1);

// --- MIDDLEWARE ---
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(cookieParser());

// ============================================
// SECURITY MIDDLEWARE (CRITICAL)
// ============================================

// 0. HTTPS Enforcement (Production Only)
if (process.env.NODE_ENV === 'production') {
    app.use(enforceHTTPS);
}

// 1. CORS - Allow Credentials
app.use(cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-CSRF-Token']
}));

// 2. HELMET - Security Headers
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    contentSecurityPolicy: false,
    xFrameOptions: false,
}));

// 3. Additional Security Headers
app.use(additionalSecurityHeaders);

// 4. Security Middleware (NoSQL Injection, HPP)
setupSecurityMiddleware(app);

// 5. Morgan Logging (skip in production for performance)
if (process.env.NODE_ENV !== 'production') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// 6. Security Event Logging
app.use(securityLogger);

// 7. Cache Control (Anti-cache headers)
app.use((req, res, next) => {
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Surrogate-Control', 'no-store');
    next();
});

// 8. Static Files (Uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- ROUTES ---
// Apply general API rate limiter to all API routes
app.use('/api', apiLimiter);

app.use('/api/auth', auth);
app.use('/api/consultancies', consultancies);
app.use('/api/students', students);
app.use('/api/upload', uploadRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/public', publicRoutes);
app.use('/api/universities', universityRoutes);
app.use('/api/holidays', holidayRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/about', aboutUsRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/contact-settings', contactSettingsRoutes);
app.use('/api/contact-messages', contactMessageRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/job-applications', jobApplicationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/sessions', require('./routes/sessionRoutes'));
app.use('/api/subscribe', require('./routes/subscriberRoutes'));
app.use('/api/site-content', require('./routes/siteContentRoutes'));
app.use('/api/dashboard', require('./routes/dashboardRoutes'));
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/exchange-rate', require('./routes/exchangeRateRoutes'));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({
        message: "KDR Consultancy API is running...",
        environment: process.env.NODE_ENV,
        timestamp: new Date().toISOString()
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('[ERROR]', err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: process.env.NODE_ENV === 'production'
            ? 'Internal Server Error'
            : err.message || 'Server Error'
    });
});

// Initialize Socket.io
const io = new Server(server, {
    cors: {
        origin: CLIENT_URL,
        methods: ["GET", "POST"],
        credentials: true
    }
});

// Socket Logic
io.on('connection', (socket) => {
    console.log(`[SOCKET] User Connected: ${socket.id}`);

    // Join a specific room based on User ID (for private notifications)
    socket.on('join_room', (userId) => {
        socket.join(userId);
        console.log(`[SOCKET] User ${userId} joined their private room`);
    });

    socket.on('disconnect', () => {
        console.log('[SOCKET] User Disconnected', socket.id);
    });
});

// Make 'io' accessible in Controllers
app.set('io', io);

// Start server
server.listen(PORT, () => {
    console.log(`
============================================
  UMI Abroad Study API Server
  Environment: ${process.env.NODE_ENV}
  Port: ${PORT}
  Client URL: ${CLIENT_URL}
============================================
  `);
});
