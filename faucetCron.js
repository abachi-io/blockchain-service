const dotenv = require('dotenv')
const path = require('path');
const axios = require('axios')

const addressesToFund = [
  '0xd126a704aCbE2272694103d03eD610105e8859d4',
  '0x9cC89E25066EdEDc27E6794dE45794217e6a2B32'
]

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

if (process.env.NODE_ENV === 'dev') {
    dotenv.config( { path: path.resolve(process.cwd(), `./environments/${process.env.NODE_ENV}/.env`) });
}

function getEth() {
  for(let i = 0; i < addressesToFund.length; i++) {
    axios.post('https://api.faucet.matic.network/transferTokens', {
      "address": `${addressesToFund[i]}`,
      "network": "mumbai",
      "token": "maticToken"
    })
    .then(response => {
      console.log(response.data)
    })
    .catch(error => {
      console.log(error)
    })
  }

}


console.log(`MATIC (TESTNET) FAUCET DRIP`);

getEth()
setInterval(() => {
  getEth()
}, 120000)
