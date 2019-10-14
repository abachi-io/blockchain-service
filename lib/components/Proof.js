const fs = require('fs')
const path = require('path');
const KeyStore = require('../models/KeyStore.js')
const logger = require('../logger')

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
        const abiPath = path.resolve(path.join(`./lib/contracts/${contract}.abi`))
        const bytecodePath = path.resolve(path.join(`./lib/contracts/${contract}.bin`))
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
              const pendingNonces = Object.keys(txpool.pending[this.publicKey])
              transactionCount = parseInt(pendingNonces[pendingNonces.length-1])+1
            }
          }
          logger.debug(`Nounce: ${transactionCount}`)
          resolve(transactionCount)
        })
        .catch(reject)
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
              if(txpool.pending[this.publicKey][`${nonce}`]) {
                let pendingTransaction = txpool.pending[this.publicKey][`${nonce}`]
                resolve(pendingTransaction.hash)
              } else {
                reject(`No pending transaction found for ${this.publicKey} at nonce ${nonce}`)
              }

            } else {
              reject(`No pending transaction found for ${this.publicKey}`)
            }
          } else {
            reject('No pending transactions found')
          }
        })
        .catch(reject)
    })
  }

  sendSignedTransaction(signedTransaction, _id) {
    return new Promise((resolve, reject) => {
      this.web3.eth.sendSignedTransaction(signedTransaction.rawTransaction)
        .then(receipt => {
          try {
            receipt.transactionHash
            KeyStore.findOne({_id})
              .then(doc=> {
                if(doc) {
                  doc.success = true
                  doc.transactionHash = receipt.transactionHash
                  doc.save()
                }
              })
          } catch (error) {
            console.log(error)
          }
            resolve(receipt)
        })
        .catch(reject)
    })
  }

  generateTransactionParams(payload) {
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
        resolve({transactionParams, nonce})
      })
      .catch(reject)
    })
  }

  signTransaction(transactionParams) {
    return new Promise((resolve, reject) => {
      this.web3.eth.accounts.signTransaction(transactionParams, this.privateKey)
        .then(resolve)
        .then(reject)
    })
  }

  sendTransactionAndRaceTimeout(signedTransaction, _id) {
    return new Promise((resolve, reject) => {
      Promise.race([
        this.sendSignedTransaction(signedTransaction, _id),
        this.timeout()
        ])
        .then(resolve)
        .catch(reject)
    })
  }

  resolveTimedOutSetTransaction(nonce, _id) {
    return new Promise((resolve, reject) => {
      logger.debug('Resolving timed out transaction')
      Promise.all([this.getPendingHash(nonce), KeyStore.findOne({_id})])
      .then(data => {
        const transactionHash = data[0]
        const doc = data[1]
        if(doc) {
          doc.success = false
          doc.transactionHash = transactionHash
          doc.save()
        }
        logger.debug(`Found transaction hash: ${transactionHash}`)
        return resolve(transactionHash);
      })
      .catch(error => {
        logger.debug(`Error finding transaction hash for nonce: ${nonce}`)
        resolve('nullPending')
      })
    })
  }

  // sendTransaction(payload, _id) {
  //   return new Promise((resolve, reject) => {
  //     this.generateTransactionParams(payload)
  //       .then(data => {
  //         this.signTransaction(data.transactionParams, this.privateKey)
  //           .then(signedTransaction => {
  //             this.sendTransactionAndRaceTimeout(signedTransaction, _id)
  //               .then(receipt => {
  //                 if(receipt === 'timeout') {
  //                   this.resolveTimedOutSetTransaction(data.nonce, _id)
  //                     .then(resolve)
  //                     .catch(reject)
  //                 } else {
  //                   return resolve(receipt);
  //                 }
  //               })
  //           .catch(reject)
  //         })
  //         .catch(reject)
  //     })
  //     .catch(reject)
  //   })
  // }

  async sendTransaction(payload, _id) {
    return new Promise( async(resolve, reject) => {
      try {
        const data = await this.generateTransactionParams(payload)
        const {nonce, transactionParams} = data
        const signedTransaction = await this.signTransaction(transactionParams, this.privateKey)
        const receipt = await this.sendTransactionAndRaceTimeout(signedTransaction, _id)

        if(receipt === 'timeout') {
          logger.debug(`Timedout waiting for transaction receipt`)
          const transactionHash = await this.resolveTimedOutSetTransaction(data.nonce, _id)
          resolve({type: 'hash', data: transactionHash})
        } else {
          logger.debug(`Got transaction receipt`)
          resolve({type: 'receipt', data: receipt})
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  set(key, store, keyStoreId) {
    return new Promise((resolve, reject) => {
       const encodedABI = this.contract.methods.set(key, store).encodeABI()
       this.sendTransaction(encodedABI, keyStoreId)
        .then(resolve)
        .catch(reject)
    })
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.contract.methods.get(key).call()
        .then(resolve)
        .catch(reject)
    })
  }

  exists(key) {
    return new Promise((resolve, reject) => {
      this.contract.methods.exists(key).call()
      .then(resolve)
      .catch(reject)
    })
  }

  timestamp(key) {
    return new Promise((resolve, reject) => {
      this.contract.methods.timestamp(key).call()
      .then(resolve)
      .catch(reject)
    })
  }

  remove(key) {
    return new Promise((resolve, reject) => {
      const encodedABI = this.contract.methods.remove(key).encodeABI()
      this.sendTransaction(encodedABI)
      .then(resolve)
      .catch(reject)
    })
  }



}

module.exports = Proof;
