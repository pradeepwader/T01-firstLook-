const path = require('path');
const fs = require('fs');
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const rateLimit = require('express-rate-limit');

const env = require('./config/env');
const routes = require('./routes');
const { webhook } = require('./controllers/paymentController');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1); // correct client IPs behind Nginx / Render / Railway

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'script-src': ["'self'", 'https://sdk.cashfree.com'],
        'frame-src': ["'self'", 'https://sdk.cashfree.com', 'https://sandbox.cashfree.com', 'https://payments.cashfree.com'],
        'connect-src': ["'self'", 'https://sdk.cashfree.com', 'https://api.cashfree.com', 'https://sandbox.cashfree.com', 'https://payments.cashfree.com'],
        'img-src': ["'self'", 'data:', 'https:'],
        'style-src': ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        'font-src': ["'self'", 'https://fonts.gstatic.com'],
      },
    },
  })
);
app.use(cors({ origin: env.clientUrl, credentials: true }));
if (env.nodeEnv !== 'test') app.use(morgan(env.isProd ? 'combined' : 'dev'));

// Webhook must receive the RAW body for signature verification -> before express.json()
app.post('/api/payments/webhook', express.raw({ type: '*/*', limit: '1mb' }), webhook);

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(cookieParser());

app.use('/api', rateLimit({ windowMs: 15 * 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false }));
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 20, message: { success: false, message: 'Too many attempts. Try again later.' } });
app.use(['/api/auth/login', '/api/auth/register', '/api/auth/forgot-password'], authLimiter);

// Only thumbnails are public. Product files live in /storage and are served after purchase only.
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.use('/api', routes);
app.use('/api', (req, res) => res.status(404).json({ success: false, message: 'Endpoint not found' }));

// Production: serve the built React app from the same origin (cookies "just work")
const dist = path.join(__dirname, '..', '..', 'client', 'dist');
if (env.isProd && fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (req, res) => res.sendFile(path.join(dist, 'index.html')));
}

app.use(errorHandler);

module.exports = app;
