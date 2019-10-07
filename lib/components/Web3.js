const web3 = require('web3');

class Web3 {
    constructor() {
      this.host = process.env.WEB3_HTTP || 'http://testnet.ledgerium.net:8545/'
      this.web3Http = new web3(new web3.providers.HttpProvider(this.host));
      this.web3Http.eth.extend({
        property: 'txpool',
        methods: [{
          name: 'content',
          call: 'txpool_content'
        },{
          name: 'inspect',
          call: 'txpool_inspect'
        },{
          name: 'status',
          call: 'txpool_status'
        }]
      })
    }

}

module.exports = Web3;
