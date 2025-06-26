const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const pageRoutes = require('./routes/pageRoutes');
const carRoutes = require('./routes/cars');

const app = express();

// --- Static Mode Flag ---
global.isStaticMode = true;

// --- View Engine Setup ---
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);
app.locals._layoutFile = 'layout.ejs';

// --- Middleware ---
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "img-src": ["'self'", "data:", "https:"],
      "script-src": ["'self'", "'unsafe-inline'", "https:"],
      "style-src": ["'self'", "'unsafe-inline'", "https:"]
    }
  }
}));
app.use(compression());
app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// --- Static File Paths ---
app.use('/assets', express.static(path.join(__dirname, 'assets')));

// --- Session Setup ---
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// --- Flash Messages ---
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success');
    res.locals.error_msg = req.flash('error');
    next();
});

// --- Routes ---
app.use('/', pageRoutes);
app.use('/cars', carRoutes);

// --- Error Handling ---
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', {
    title: 'Error',
    message: 'Something went wrong!',
    page: 'error'
  });
});

// --- MongoDB Connection (only in dynamic mode) ---
if (!global.isStaticMode) {
  mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/autovault', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
    .then(() => console.log('✅ Connected to MongoDB'))
    .catch(err => console.error('❌ MongoDB connection error:', err));
}

// --- Start Server ---
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
  console.log(`🟢 Mode: ${global.isStaticMode ? 'STATIC (mock data only)' : 'DYNAMIC (MongoDB connected)'}`);
});
