// Import modules
const express = require('express');
const cors = require('cors');
const logger = require('morgan');

// Instantiate express
const app = express()

// Middlewares
app.use(logger('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes
app.use(require('./routes'));

// Serve static files from public-folder
app.use(express.static('public'));

// Export
module.exports = app