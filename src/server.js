const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const ejsLayouts = require('express-ejs-layouts');

require('dotenv').config();
const PORT = process.env.PORT || 3000;

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const forgotPasswordRoutes = require('./routes/forgotPasswordRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '..', 'public'), { index: false }));
app.use(ejsLayouts);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.set('layout', 'layouts/main');

connectDB();

app.get('/', (req, res) => {
  res.redirect('/login');
});

app.get('/forgotpassword', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.use('/', authRoutes);
app.use('/api', forgotPasswordRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Backend Nodejs is running on port : ${PORT}`);
});
