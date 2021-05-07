const chalk = require('chalk')
const fs = require('fs')

class FileInspector {
  constructor() {
    this.inspectRequiredFiles()
  }

  inspectRequiredFiles() {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(`.env`)) {
        return;
      } else {
        console.log(chalk.yellow(`[+] Missing .env file, attempting to create`))
          fs.writeFile('.env', `WEB3_HTTP=https://rpc-mumbai.maticvigil.com/\nSERVER_PORT=9899`, (error) => {
          if (error) return reject({});
          console.log(chalk.green(`[+] Successfully created an .env file`))
        });
      }
    })
  }
}

module.exports = FileInspector
