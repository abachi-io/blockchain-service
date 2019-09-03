process.title = "Blockchain Service"
const dotenv = require('dotenv').config()
const FileInspector = require('./components/FileInspector')
const fileInspector = new FileInspector()
const chalk = require('chalk')
const cluster = require('cluster')
const express = require('express');
const app = express();
const cors = require('cors');
const port = process.env.SERVER_PORT || 9999;

const server = app.listen(port, () => {
  console.log(chalk.green(`[+] Listening on port: ${port}`))
  const router = require('./routes/');
  app.use(express.json());
  app.use(cors());
  app.use('/', router)
})
