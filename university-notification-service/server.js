require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initDatabase } = require('./config/db');
const { startSchedulers } = require('./schedulers/cronJobs');

const notificationRoutes = require('./routes/notifications');
const announcementRoutes = require('./routes/announcements');
const preferenceRoutes = require('./routes/preferences');

const app = express();
const PORT = process.env.PORT || 5200;

// Enable CORS
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/', (req, res) => {
  res.json({
    service: 'EduCore Notification & Communication Microservice',
    status: 'UP',
    port: PORT,
    timestamp: new Date().toISOString()
  });
});

// Mount Routes (supporting both direct and /api prefixes)
app.use('/notifications', notificationRoutes);
app.use('/api/notifications', notificationRoutes);

app.use('/announcements', announcementRoutes);
app.use('/api/announcements', announcementRoutes);

app.use('/notification-preferences', preferenceRoutes);
app.use('/api/notification-preferences', preferenceRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Notification Service Error]:', err.stack);
  res.status(500).json({ error: 'Internal Server Error in Notification Service' });
});

async function bootstrap() {
  await initDatabase();
  startSchedulers();

  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🔔 Notification Service running on http://localhost:${PORT}`);
    console.log(`-> Notifications: http://localhost:${PORT}/notifications`);
    console.log(`-> Announcements: http://localhost:${PORT}/announcements`);
    console.log(`-> Preferences:   http://localhost:${PORT}/notification-preferences`);
    console.log(`=======================================================`);
  });
}

bootstrap();
