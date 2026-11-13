const path = require('path');
const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products.routes');
const { errorHandler, notFound } = require('./utils/errorHandler');

const app = express();

app.use(cors());
app.use(express.json());

// API
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/products', productRoutes);
app.use('/api', notFound);

// Frontend (static presentation layer)
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

app.use(errorHandler);

module.exports = app;
