process.title = "Blockchain Service"
const dotenv = require('dotenv').config()
const chalk = require('chalk')

const server = require('./lib/server.js')
const port = process.env.SERVER_PORT || 9899;
server.listen(port, () => {
  console.log(chalk.green(`[+] Listening on port: ${port}`))
})
