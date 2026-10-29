require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
    origin: true,
    credentials: true,
}));

// Add structured logging
app.use(morgan('combined'));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: { error: 'Too many requests from this IP, please try again later.' }
});
app.use(limiter);

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'API Gateway is running' });
});

async function startServer() {
    const { createProxyMiddleware } = await import('http-proxy-middleware');

    // Proxy for ASP.NET Core Fee, Payment & Scholarship Microservice (Port 5100)
    // Mounted before /api so /api/fee and /api/payment correctly route to ASP.NET Core
    app.use(['/fee', '/payment', '/scholarship', '/api/fee', '/api/payment', '/api/scholarship'], createProxyMiddleware({
        target: process.env.FEE_SERVICE_URL || 'http://localhost:5100',
        changeOrigin: true,
        pathRewrite: (path, req) => {
            // Strip /api prefix if present so /api/fee/xxx becomes /fee/xxx
            return req.originalUrl.replace(/^\/api\//, '/');
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`[FEE PROXY REQ] ${req.method} ${req.url} -> ${proxyReq.path}`);
            },
            error: (err, req, res) => {
                console.error('Fee Service Proxy Error:', err);
                if (!res.headersSent) {
                    res.status(502).json({ error: 'Bad Gateway to Fee & Payment Service' });
                }
            }
        }
    }));

    // Proxy for Node.js Notifications & Communication Microservice (Port 5200)
    app.use([
        '/notifications',
        '/announcements',
        '/notification-preferences',
        '/api/notifications',
        '/api/announcements',
        '/api/notification-preferences'
    ], createProxyMiddleware({
        target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5200',
        changeOrigin: true,
        pathRewrite: (path, req) => {
            return req.originalUrl.replace(/^\/api\//, '/');
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`[NOTIF PROXY REQ] ${req.method} ${req.url} -> ${proxyReq.path}`);
            },
            error: (err, req, res) => {
                console.error('Notification Service Proxy Error:', err);
                if (!res.headersSent) {
                    res.status(502).json({ error: 'Bad Gateway to Notification Service' });
                }
            }
        }
    }));

    // Proxy for Exam & Timetable Service (Port 8083)
    app.use([
        '/exams',
        '/exam-rooms',
        '/timetable',
        '/api/exams',
        '/api/exam-rooms',
        '/api/timetable'
    ], createProxyMiddleware({
        target: process.env.EXAM_SERVICE_URL || 'http://localhost:8083',
        changeOrigin: true,
        pathRewrite: (path, req) => {
            return req.originalUrl.replace(/^\/api\//, '/');
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`[EXAM PROXY REQ] ${req.method} ${req.url} -> ${proxyReq.path}`);
            },
            error: (err, req, res) => {
                console.error('Exam Service Proxy Error:', err);
                if (!res.headersSent) {
                    res.status(502).json({ error: 'Bad Gateway to Exam Service' });
                }
            }
        }
    }));

    // Proxy for Placement & Career Management Service (Port 8084)
    app.use([
        '/placement',
        '/api/placement'
    ], createProxyMiddleware({
        target: process.env.PLACEMENT_SERVICE_URL || 'http://localhost:8084',
        changeOrigin: true,
        pathRewrite: (path, req) => {
            return req.originalUrl.replace(/^\/api\//, '/');
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`[PLACEMENT PROXY REQ] ${req.method} ${req.url} -> ${proxyReq.path}`);
            },
            error: (err, req, res) => {
                console.error('Placement Service Proxy Error:', err);
                if (!res.headersSent) {
                    res.status(502).json({ error: 'Bad Gateway to Placement Service' });
                }
            }
        }
    }));

    // Proxy for ASP.NET Core Library Management Microservice (Port 5300)
    app.use([
        '/library',
        '/api/library'
    ], createProxyMiddleware({
        target: process.env.LIBRARY_SERVICE_URL || 'http://localhost:5300',
        changeOrigin: true,
        pathRewrite: (path, req) => {
            return req.originalUrl.replace(/^\/api\//, '/');
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`[LIBRARY PROXY REQ] ${req.method} ${req.url} -> ${proxyReq.path}`);
            },
            error: (err, req, res) => {
                console.error('Library Service Proxy Error:', err);
                if (!res.headersSent) {
                    res.status(502).json({ error: 'Bad Gateway to Library Service' });
                }
            }
        }
    }));

    // Proxy for Spring Boot Core Services
    app.use('/api', createProxyMiddleware({
        target: process.env.SPRING_BOOT_URL || 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
            '^/': '/api/'
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`[PROXY REQ] ${req.method} ${req.url} -> ${proxyReq.path}`);
                console.log(`[PROXY HEADERS]`, proxyReq.getHeaders());
            },
            error: (err, req, res) => {
                console.error('Spring Boot Proxy Error:', err);
                if (!res.headersSent) {
                    res.status(502).json({ error: 'Bad Gateway to Spring Boot Service' });
                }
            }
        }
    }));

    // Proxy for Python FastAPI Generative AI Service
    app.use('/ai', createProxyMiddleware({
        target: process.env.AI_SERVICE_URL || 'http://localhost:8000',
        changeOrigin: true,
        pathRewrite: {
            '^/ai': ''
        },
        on: {
            error: (err, req, res) => {
                console.error('FastAPI Proxy Error:', err);
                if (!res.headersSent) {
                    res.status(502).json({ error: 'Bad Gateway to AI Service' });
                }
            }
        }
    }));

    // Proxy for LMS (Assignment & Learning Management) Service
    app.use('/lms', createProxyMiddleware({
        target: process.env.LMS_SERVICE_URL || 'http://localhost:8082',
        changeOrigin: true,
        pathRewrite: {
            '^/': '/lms/'
        },
        on: {
            proxyReq: (proxyReq, req, res) => {
                console.log(`[LMS PROXY REQ] ${req.method} ${req.url} -> ${proxyReq.path}`);
            },
            error: (err, req, res) => {
                console.error('LMS Service Proxy Error:', err);
                if (!res.headersSent) {
                    res.status(502).json({ error: 'Bad Gateway to LMS Service' });
                }
            }
        }
    }));

    // Global error handler
    app.use((err, req, res, next) => {
        console.error('Gateway Internal Error:', err.stack);
        res.status(500).json({ error: 'Internal Server Error in API Gateway' });
    });

    app.listen(PORT, () => {
        console.log(`API Gateway started on http://localhost:${PORT}`);
        console.log('-> Proxying /api to http://localhost:8080 (Spring Boot Core)');
        console.log('-> Proxying /lms to http://localhost:8082 (LMS Service)');
        console.log('-> Proxying /exams, /timetable to http://localhost:8083 (Exam Service)');
        console.log('-> Proxying /placement to http://localhost:8084 (Placement Service)');
        console.log('-> Proxying /fee, /payment to http://localhost:5100 (ASP.NET Core Fee Service)');
        console.log('-> Proxying /notifications to http://localhost:5200 (Notification Service)');
        console.log('-> Proxying /library to http://localhost:5300 (ASP.NET Core Library Service)');
        console.log('-> Proxying /ai to http://localhost:8000 (FastAPI AI Service)');
    });
}

startServer();
