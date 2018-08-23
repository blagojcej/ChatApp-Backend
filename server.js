const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const logger = require('morgan');

const app = express();

//Import secrets.js
const dbConfig = require('./config/secrets');

app.use(express.json({
    limit: '50mb'
}));
app.use(express.urlencoded({
    extended: true,
    limit: '50mb'
}));
app.use(cookieParser());
// app.use(logger('dev'));

mongoose.Promise = global.Promise;
mongoose.connect(dbConfig.url, {
    useNewUrlParser: true
});

const auth = require('./routes/authRoutes');

app.use('/api/chatapp', auth);

app.listen(3000, () => {
    console.log('Running on port 3000');
});