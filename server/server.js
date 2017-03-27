//Server setup
const express = require('express');
const app = express();

const path = require('path');

//Environment variables
require('dotenv').config();

//Database setup
var db  = require('../database/db');
// const db = require('../database/utiles.js');
// db.initialisation();
// app.set('db', db);

//Middleware setup
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true}));
app.use(bodyParser.json());

//Routers
const userRouter = require('./routers/userRouter.js');
const listRouter = require('./routers/listRouter.js');
const storeRouter = require('./routers/storeRouter.js');

app.use('/user', userRouter);
app.use('/list', listRouter);
app.use('/store', storeRouter);

//Serve index.html at every other route that comes to server
app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, '..', 'public/index'));
});

app.listen(process.env.SERVER_PORT, function () {
  console.log(`TripWreck is running on port ${process.env.SERVER_PORT}!`);
});

module.exports = app;