const dotenv = require('dotenv').config()
const web3 = require('web3');

class Web3 {
    constructor() {
      this.host = process.env.WEB3_HTTP || 'http://testnet.ledgerium.net:8545/'
      this.web3Http = new web3(new web3.providers.HttpProvider(this.host));
    }

}

module.exports = Web3;
