process.title = "Blockchain Service"
const dotenv = require('dotenv').config()
const chalk = require('chalk')
const cluster = require('cluster')
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.SERVER_PORT || 9999;
const mongoose = require('mongoose');

const server = app.listen(port, () => {
  console.log(chalk.green(`[+] Listening on port: ${port}`))
  const router = require('./routes/');
  app.use(express.json());
  app.use(cors());
  app.use('/', router)
})

mongoose.connect('mongodb://127.0.0.1/lucaHash', { useNewUrlParser: true });
  mongoose.connection.on('connected', () => {
  console.log(chalk.green(`[+] Connected to MongoDB`));
});

mongoose.set('useFindAndModify', false);

mongoose.connection.on('error', (err) => {
  console.log(chalk.red(`[X] ${err}`))
});
