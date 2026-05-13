const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/auth.routes');

const app = express();


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Simple CORS middleware for development
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if (req.method === 'OPTIONS') {
        res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS');
        return res.sendStatus(200);
    }
    next();
});


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));


connectDB();


app.use('/', authRoutes);


const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Backend Nodejs is running on port : ${PORT}`);
});