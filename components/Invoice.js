const dotenv = require('dotenv').config()
const fs = require('fs')
const path = require('path');

class Invoice {
  constructor(web3) {
    this.web3 = web3.web3Http
    this.abi = ''
    this.bytecode = ''
    this.contractAddress = process.env.CONTRACT_ADDRESS
    this.contract = null
    this.publicKey = process.env.PUBLIC_KEY
    this.privateKey = process.env.PRIVATE_KEY
    this.init()
  }

  init() {
    this.readContract('invoice')
      .then(contract => {
        this.abi = contract.abi
        this.bytecode = contract.bytecode
        this.contract = new this.web3.eth.Contract(contract.abi, this.contractAddress)
        // this.storeOnBlockchain('21212', '0x12312312321')
          // this.existsOnBlockchain('1')
        // this.sendTransaction('0x7f7465737432000000000000000000000000000000000000000000000000000000600057')
        //   .then(console.log)
        //   .catch(console.log)
      })
      .catch(console.log)
  }

  readContract(contract) {
    return new Promise((resolve, reject) => {
      try {
        const filePath = path.resolve(path.join(`./contracts/${contract}.json`))
        const file = fs.readFileSync(filePath, 'utf8');
        const rawContract = JSON.parse(file)
        resolve({
          abi: rawContract.abi,
          bytecode: rawContract.bytecode
        })
      } catch (error) {
        reject(error)
      }
    })
  }

  timeout(ms) {
    return new Promise( (resolve, reject) => {
      timeout(()=>{
        resolve({})
      }, ms)
    })
  }

  sendTransaction(payload) {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.web3.eth.getGasPrice(),
        this.web3.eth.getBalance(this.publicKey),
        this.web3.eth.getTransactionCount(this.publicKey, 'pending')
      ])
      .then(data => {
        const gasPrice = data[0]
        const balance = data[1]
        const nonce = data[2]
        const transactionParams = {
          nonce,
          gasPrice: this.web3.utils.toHex(gasPrice),
          gasLimit: '0x47b760',
          to: this.contractAddress,
          from: this.publicKey,
          value: this.web3.utils.toHex(0),
          data: payload
        }

        this.web3.eth.accounts.signTransaction(transactionParams, this.privateKey)
          .then(signedTransaction => {
            this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
              .then(receipt => {
                console.log(receipt)
              })
              .catch(error => {
                console.log('Send error ', error)
              })
          })
          .catch(error => {
            return reject(error);
          })
      })
      .catch(error => {
        return reject(error);
      })
    })

  }

  storeOnBlockchain(invoiceId, hash) {
    return new Promise((resolve, reject) => {
       const encodedABI  = this.contract.methods.addInvoice(invoiceId, hash).encodeABI()
       this.sendTransaction(encodedABI)
        .then(receipt => {
          resolve(receipt)
        })
        .catch(error => {
          reject(error)
        })
    })
  }

  getFromBlockchain(hash) {
    return new Promise((resolve, reject) => {
      this.contract.methods.getInvoiceID(hash).call({from : this.publicKey})
        .then(hash => {
          resolve(hash)
        })
        .catch(error => {
          reject(error)
        })
    })

  }

  existsOnBlockchain(hash) {
    return new Promise((resolve, reject) => {
      this.contract.methods.isHashExists(hash).call({from : this.publicKey})
        .then(bool => {
          resolve(bool)
        })
        .catch(error => {
          reject(error)
        })
    })

  }




}

module.exports = Invoice;
