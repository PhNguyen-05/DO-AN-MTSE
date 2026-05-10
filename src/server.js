const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


connectDB();


app.use('/', authRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Backend Nodejs is running on port : ${PORT}`);
});