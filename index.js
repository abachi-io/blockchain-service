process.title = "Blockchain Service"
const dotenv = require('dotenv').config()
const chalk = require('chalk')
const cluster = require('cluster')
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.SERVER_PORT || 9899;

const server = app.listen(port, () => {
  console.log(chalk.green(`[+] Listening on port: ${port}`))
  const router = require('./routes/');
  app.use(express.json());
  app.use(cors());
  app.use('/', router)
})
