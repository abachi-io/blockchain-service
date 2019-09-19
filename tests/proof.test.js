const Web3 = require('../components/Web3')
const web3 = new Web3()
const Proof = require('../components/Proof')
const proof = new Proof(web3)
const crypto = require('crypto')



class ProofTest() {
  constructor() {

  }

  generateStrings() {
    const key = Math.random().toString(36).slice(2)
    const store = crypto.createHash('sha256').update(Math.random().toString(36).slice(2)).digest('hex')
    return ({
      key,
      store
    })
  }

  async integration() {
    const values = this.generateStrings()
    const exists = await proof.exists(values.key)
    console.log(exists)
    consoole.log(process.env.PWD)
  }

}


const test = generateStrings()
setTimeout(()=> {
  proof.exists(test.key)
    .then(bool => {
      console.log(bool)
    })
},5000)
