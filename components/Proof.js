const dotenv = require('dotenv').config()
const fs = require('fs')
const path = require('path');
const KeyStore = require('../models/KeyStore.js')

class Proof {
  constructor(web3) {
    this.web3 = web3.web3Http
    this.abi = ''
    this.bytecode = ''
    this.contractAddress = this.web3.utils.toChecksumAddress(process.env.PROOF_CONTRACT_ADDRESS)
    this.contract = null
    this.publicKey = this.web3.utils.toChecksumAddress(process.env.PUBLIC_KEY)
    this.privateKey = process.env.PRIVATE_KEY
    this.init()
  }

  init() {
    this.readContract('Proof')
      .then(contract => {
        this.abi = contract.abi
        this.bytecode = contract.bytecode
        this.contract = new this.web3.eth.Contract(contract.abi, this.contractAddress)
      })
      .catch(console.log)
  }

  readContract(contract) {
    return new Promise((resolve, reject) => {
      try {
        const abiPath = path.resolve(path.join(`./contracts/${contract}.abi`))
        const bytecodePath = path.resolve(path.join(`./contracts/${contract}.bin`))
        const abiFile = fs.readFileSync(abiPath, 'utf8');
        const bytecodeFile = fs.readFileSync(bytecodePath, 'utf8');
        const abi = JSON.parse(abiFile)
        const bytecode = `0x${bytecodeFile}`
        return resolve({ abi, bytecode});
      } catch (error) {
        return reject(error);
      }
    })
  }

  getNonce() {
    return new Promise((resolve, reject) => {
      Promise.all([
        this.web3.eth.txpool.content(),
        this.web3.eth.getTransactionCount(this.publicKey, 'pending')
      ])
        .then(data => {
          const txpool = data[0]
          let transactionCount = data[1]
          if(txpool.pending) {
            if(txpool.pending[this.publicKey]) {
              transactionCount += Object.keys(txpool.pending[this.publicKey]).length
              resolve(transactionCount)
            } else {
              resolve(transactionCount)
            }
          } else {
            resolve(transactionCount)
          }
        })
        .catch(error => {
          return reject(error)
        })
    })
  }

  timeout() {
    return new Promise((resolve, reject) => {
      setTimeout(()=>{
        resolve('timeout')
      }, parseInt(process.env.TRANSACTION_TIMEOUT || 10000))
    })
  }

  getPendingHash(nonce) {
    return new Promise((resolve, reject) => {
      this.web3.eth.txpool.content()
        .then(txpool => {
          if(txpool.pending) {
            if(txpool.pending[this.publicKey]) {
              let pendingTransaction = txpool.pending[this.publicKey][`${nonce}`]
              console.log('found', pendingTransaction.hash)
              resolve(pendingTransaction.hash)
            } else {
              console.log('not fond')
              reject('')
            }
          } else {
            reject('')
          }
        })
        .catch(error => {
          console.log(error)
          reject(error)
        })
    })

  }

  sendTransaction(payload, _id) {
    console.log(_id)
    return new Promise((resolve, reject) => {
      Promise.all([
        this.web3.eth.getGasPrice(),
        this.web3.eth.getBalance(this.publicKey),
        this.getNonce()
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
            Promise.race([
              this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction),
              this.timeout()
            ])
            .then(receipt => {
              if(receipt === 'timeout') {
                Promise.all([this.getPendingHash(nonce), KeyStore.findOne({_id})])
                  .then(data => {
                    const transactionHash = data[0]
                    const doc = data[1]
                    if(doc) {
                      console.log(doc)
                      doc.success = false
                      doc.transactionHash = transactionHash
                      doc.save()
                    }
                    return reject(`Timed out waiting for a receipt: TX hash: ${transactionHash}`);
                  })
              } else {
                KeyStore.findOne({_id})
                  .then(doc=> {
                    if(doc) {
                      doc.success = true
                      doc.transactionHash = receipt.transactionHash
                      doc.save()
                    }
                  })
                return resolve(receipt);
              }
            })
            .catch(error => {
              return reject(error);
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

  set(key, store, keyStoreId) {
    return new Promise((resolve, reject) => {
       const encodedABI = this.contract.methods.set(key, store).encodeABI()
       this.sendTransaction(encodedABI, keyStoreId)
        .then(receipt => {
          return resolve(receipt);
        })
        .catch(error => {
          return reject(error);
        })
    })
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.contract.methods.get(key).call()
        .then(result => {
          resolve(result)
        })
        .catch(console.log)
    })
  }

  exists(key) {
    return new Promise((resolve, reject) => {
      this.contract.methods.exists(key).call()
        .then(exists => {
          return resolve(exists);
        })
        .catch(error => {
          return reject(error);
        })
    })
  }

  timestamp(key) {
    return new Promise((resolve, reject) => {
      this.contract.methods.timestamp(key).call()
        .then(lastUpdated => {
          return resolve(lastUpdated);
        })
        .catch(error => {
          return reject(error);
        })
    })
  }

  remove(key) {
    return new Promise((resolve, reject) => {
      const encodedABI = this.contract.methods.remove(key).encodeABI()
      this.sendTransaction(encodedABI)
       .then(bool => {
         return resolve(bool);
       })
       .catch(error => {
         return reject(error);
       })
    })
  }



}

module.exports = Proof;
