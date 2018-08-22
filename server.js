const express = require('express');
const mongoose = require('mongoose');

const app = express();

mongoose.Promise = global.Promise;
mongoose.connect('mongodb://localhost/socialapp');

app.listen(3000, () => {
    console.log('Running on port 3000');
});