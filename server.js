const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const dotenv = require('dotenv');

const verifyRoutes = require('./api/routes/verify');



const authRoutes = require('./api/routes/auth');

const app = express();
const PORT = process.env.PORT || 3000;

const url = "mongodb+srv://sinhasahilcr7:node-shop@node-rest-shop.ez78bab.mongodb.net/?retryWrites=true&w=majority"
mongoose.connect(url).then(db => {
  console.log('connected to database')
});

app.use(bodyParser.json());

app.use('/auth', authRoutes);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
