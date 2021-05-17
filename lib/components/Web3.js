const web3 = require('web3');

class Web3 {
    constructor() {
      this.host = process.env.BLOCKCHAIN_RPC_URL
      this.web3Http = new web3(new web3.providers.HttpProvider(this.host));
    }

}

module.exports = Web3;
