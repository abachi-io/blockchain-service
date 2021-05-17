const fs = require('fs')
const logger = require('./Logger')

class FileInspector {
  constructor() {
    this.inspectRequiredFiles()
  }

  inspectRequiredFiles() {
    return new Promise((resolve, reject) => {
      if (fs.existsSync(`.env`)) {
        return;
      } else {
        logger.info(`[+] Missing .env file, attempting to create`)
          fs.writeFile('.env', `WEB3_HTTP=https://rpc-mumbai.maticvigil.com/\nSERVER_PORT=9899`, (error) => {
          if (error) {
            logger.error('[!] Error creating .env file')
            return reject({});
          }
          logger.info(`[+] Successfully created an .env file`)
        });
      }
    })
  }
}

module.exports = FileInspector
