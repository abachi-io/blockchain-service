const dotenv = require('dotenv').config()
const fs = require('fs')
const path = require('path');
const solc = require('solc')

class Proof {
  constructor(web3) {
    this.web3 = web3.web3Http
    this.abi = ''
    this.bytecode = ''
    this.contractAddress = process.env.PROOF_CONTRACT_ADDRESS
    this.contract = null
    this.publicKey = process.env.PUBLIC_KEY
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
        const filePath = path.resolve(path.join(`./contracts/${contract}.json`))
        const file = fs.readFileSync(filePath, 'utf8');
        const rawContract = JSON.parse(file)
        console.log(rawContract)
        console.log({ abi: rawContract.abi, bytecode: rawContract.bytecode })
        return resolve({ abi: rawContract.abi, bytecode: rawContract.bytecode });
      } catch (error) {
        console.log(error)
        return reject(error);
      }
    })
  }

  readContract2(contract) {
    return new Promise((resolve, reject) => {
      try {
        const file = `${contract}.sol`
        const path = `./contracts/${file}`
        const source = fs.readFileSync(path, 'UTF-8')
        const contractTemplate = {
          language: 'Solidity',
          sources: {
            [file] : {
              content: source
            }
          },
          settings: {
            outputSelection: {
              '*': {
                '*': [ '*' ]
              }
            }
          }
        };
        const parseFile = JSON.parse(solc.compile(JSON.stringify(contractTemplate)))
        const abi = parseFile.contracts['Proof.sol'].Proof.abi
        const bytecode = parseFile.contracts['Proof.sol'].Proof.evm.bytecode.object
        resolve({
          abi,
          bytecode
        });
      } catch (error) {
        reject(error)
      }
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
                return resolve(receipt);
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

  set(key, store) {
    return new Promise((resolve, reject) => {
//      this.contract.methods.set('123', '321').call()
       this.contract.methods.set(key, store).call({from : this.publicKey})
        .then(data => {
          this.contract.methods.get(key).call({from : this.publicKey})
            .then(console.log)
            .catch(console.log)
        })
        .catch(console.log)
       // const encodedABI = this.contract.methods.set(key, store).encodeABI()
       // this.sendTransaction(encodedABI)
       //  .then(receipt => {
       //    return resolve(receipt);
       //  })
       //  .catch(error => {
       //    return reject(error);
       //  })

    })
  }

  get(key) {
    return new Promise((resolve, reject) => {

      // const encodedABI = this.contract.methods.get(key).encodeABI()
      // console.log(encodedABI)
      // this.sendTransaction(encodedABI)
      //  .then(receipt => {
      //    return resolve(receipt);
      //  })
      //  .catch(error => {
      //    return reject(error);
      //  })
    })
  }

  exists(key) {
    return new Promise((resolve, reject) => {
      this.contract.methods.exists(key).call({from : this.publicKey})
        .then(bool => {
          return resolve(bool);
        })
        .catch(error => {
          return reject(error);
        })
    })
  }

  timestamp(key) {
    return new Promise((resolve, reject) => {
      this.contract.methods.timestamp(key).call({from : this.publicKey})
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
      this.contract.methods.remove(key).call({from : this.publicKey})
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
