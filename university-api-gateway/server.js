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

    // Proxy for Spring Boot Core Services
    app.use('/api', createProxyMiddleware({
        target: process.env.SPRING_BOOT_URL || 'http://localhost:8080',
        changeOrigin: true,
        pathRewrite: {
            '^/': '/api/'
        },
        onProxyReq: (proxyReq, req, res) => {
            console.log(`[PROXY REQ] ${req.method} ${req.url} -> ${proxyReq.path}`);
            console.log(`[PROXY HEADERS]`, proxyReq.getHeaders());
        },
        onError: (err, req, res) => {
            console.error('Spring Boot Proxy Error:', err);
            if (!res.headersSent) {
                res.status(502).json({ error: 'Bad Gateway to Spring Boot Service' });
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
        onError: (err, req, res) => {
            console.error('FastAPI Proxy Error:', err);
            if (!res.headersSent) {
                res.status(502).json({ error: 'Bad Gateway to AI Service' });
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
        console.log('-> Proxying /api to http://localhost:8080 (Spring Boot)');
        console.log('-> Proxying /ai to http://localhost:8000 (FastAPI AI Service)');
    });
}

startServer();
