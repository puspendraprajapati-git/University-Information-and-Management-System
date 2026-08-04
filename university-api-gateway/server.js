require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend requests
app.use(cors({
    origin: 'http://localhost:3000', // React Frontend URL
    credentials: true,
}));

// Proxy for Spring Boot Core Services
// Any request to /api/* goes to the Spring Boot backend
app.use('/api', createProxyMiddleware({
    target: 'http://localhost:8080',
    changeOrigin: true,
    pathRewrite: {
        '^/': '/api/' // Express strips '/api', so we need to add it back
    }
}));

// Proxy for Python FastAPI Generative AI Service
// Any request to /ai/* goes to the FastAPI backend
app.use('/ai', createProxyMiddleware({
    target: 'http://localhost:8000',
    changeOrigin: true,
    pathRewrite: {
        '^/ai': '' // Remove the /ai prefix when sending to python
    }
}));

// Health check endpoint
app.get('/', (req, res) => {
    res.json({ message: 'API Gateway is running' });
});

app.listen(PORT, () => {
    console.log(`API Gateway started on http://localhost:${PORT}`);
    console.log('-> Proxying /api to http://localhost:8080 (Spring Boot)');
    console.log('-> Proxying /ai to http://localhost:8000 (FastAPI AI Service)');
});
