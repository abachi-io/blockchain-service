const express = require('express');
const router = express.Router();
const Web3 = require('../components/Web3')
const web3 = new Web3()
const Invoice = require('../components/Invoice')
const invoice = new Invoice(web3)
const MerkleTree = require('../components/MerkleTree')
const merkleTree = new MerkleTree()
const Contract = require('../components/Contract')
const contract = new Contract()
const Proof = require('../components/Proof')
const proof = new Proof(web3)
const InputDataDecoder = require('ethereum-input-data-decoder');
const mongoose = require('mongoose');
const chalk = require('chalk')

const KeyStore = require('../models/KeyStore.js')
const KeyStoreHistory = require('../models/KeyStoreHistory.js')


router.get('/merkle/root/:key', (request, response) => {
  const {key} = request.params
  KeyStoreHistory.findOne({key})
    .then(doc => {
      if(!doc) return errorResponse(response, `Key provided '${key}', does not match any stored key`);
      return successResponse(response, `Returned Merkle Root for key: '${key}'`, doc.merkleRoot)
    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })
})

router.post('/merkle/verify', (request, response) => {
  const {key, merkleRoot} = request.body
  if(!key || !merkleRoot) return errorResponse(response, `Body paramater 'key' or 'merkleRoot' not sent`)
  KeyStoreHistory.findOne({key})
    .then(doc => {
      if(!doc) return errorResponse(response, `Key provided '${key}', does not match any stored key`);
      if(doc.merkleRoot === merkleRoot) {
        return successResponse(response, `Merkle root provided: '${merkleRoot}' matches Merkle root saved: '${doc.merkleRoot}'`, doc.merkleRoot);
      } else {
        return errorResponse(response, `Merkle root provided: '${merkleRoot}' does NOT match Merkle root saved: '${doc.merkleRoot}'`);

      }
    })
    .catch(error => {
      console.log(error)
      return errorResponse(response, error.message || error);
    })
})

router.post('/merkle/contains', (request, response) => {
  const {key, hash} = request.body
  if(!key || !hash) return errorResponse(response, `Body paramater 'key' or 'hash' not sent`)
  KeyStoreHistory.findOne({key}).populate('history').exec()
    .then(doc => {
      if(!doc) return errorResponse(response, `Key provided '${key}', does not match any stored key`);
      const history = doc.history
      let hashes = []
      for(let i=doc.history.length-1; i>=0; i--) {
        hashes.push(merkleTree.sha256(doc.history[i].store))
      }

      if(hashes.includes(hash)) {
        return successResponse(response, `'${hash}' was found in history for key: '${key}'` , true);
      } else {
        return successResponse(response, `${hash} was NOT found in ${key}` , false);
      }

    })
    .catch(error => {
      console.log(error)
      return errorResponse(response, error.message || error);
    })
})

router.get('/merkle/roots/:key', (request, response) => {
  const {key} = request.params
  KeyStoreHistory.findOne({key}).populate('history').exec()
    .then(doc => {
      if(!doc) return errorResponse(response, `Key provided '${key}', does not match any stored key`);
      let roots = []
      let hashes = []
      for(let i=doc.history.length-1; i>=0; i--) {
        hashes.push(merkleTree.sha256(doc.history[i].store))
        if(i == doc.history.length-1) {
          roots.push(merkleTree.createRoot(doc.history[i].store))
        } else {
          roots.push(merkleTree.appendRoot(roots[roots.length-1], merkleTree.sha256(doc.history[i].store)))
        }
      }
      return successResponse(response, `Returned Merkle Roots for key: '${key}'`, {calculatedMerkleRoot: roots[roots.length-1], storedMerkleRoot: doc.merkleRoot, merkleRoots: roots, hashes})
    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })
})


router.get('/db/all', (request, response) => {
  KeyStoreHistory.find({}).populate('history').exec()
    .then(db => {
      return successResponse(response, 'Get DB for: ALL', db)
    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })
})

router.delete('/db/all', (request, response) => {
  Promise.all([
    KeyStoreHistory.deleteMany({}),
    KeyStore.deleteMany({}),
  ])
  .then(data => {
    return successResponse(response, 'Delete DB for: ALL', data)

  })
  .catch(error => {
    return errorResponse(response, error.message || error);
  })

})

//


let mongod = false;
mongoose.connect(process.env.MONGO_URL, { useNewUrlParser: true });
  mongoose.connection.on('connected', () => {
  mongod = true
  console.log(chalk.green(`[+] Connected to MongoDB`));
});

mongoose.set('useFindAndModify', false);

mongoose.connection.on('error', (err) => {
  mongod = false
  console.log(chalk.red(`[X] ${err}`))
});

const successResponse = (response, message = null, data = null) => {
  response.status(200).send({
    success: true,
    timestamp: Date.now(),
    message,
    data
  })
}

const errorResponse = (response, message, status = 403) => {
  response.status(status).send({
    success: false,
    timestamp: Date.now(),
    message
  })
}

// General \\

router.get('/ping', (request, response) => {
  return successResponse(response, 'pong')
})

router.get('/status', (request, response) => {
  Promise.all([web3.web3Http.eth.txpool.status(), web3.web3Http.eth.isSyncing()])
    .then(data => {
      txpool = data[0]
      return successResponse(response, 'Health Check', {
        endpoint: true,
        mongod,
        node: true,
        nodeURL: process.env.WEB3_HTTP,
        nodeSynced: !data[1],
        transactionTimeoutInterval: parseInt(process.env.TRANSACTION_TIMEOUT || 10000),
        txpool: {
          pending: parseInt(txpool.pending, 16) || 0,
          qued: parseInt(txpool, 16) || 0
        }
      });
    })
    .catch(error => {
      console.log(error)
      return successResponse(response, 'Health Check', {
        endpoint: true,
        mongod,
        node: false,
        nodeURL: process.env.WEB3_HTTP,
        nodeSynced: null,
        transactionTimeoutInterval: parseInt(process.env.TRANSACTION_TIMEOUT || 10000),
        txpool: {
          pending: parseInt('NA'),
          qued: parseInt('NA')
        }
      });
    })
})

// Proof Contract \\

router.get('/proof/data/:key', (request, response) => {
    const { key } = request.params
    if(!key) throw(`Empty 'key' sent in query parameter`)
    proof.get(key)
      .then(payload => {
        return successResponse(response, `CMD: get(${key})`, {result: payload});
      })
      .catch(error => {
        return errorResponse(response, error.message || error);
      })
})



const checkBody = (request, response, next) => {
  const { key, store } = request.body;
  if(!key || !store) return errorResponse(response, `Body paramater 'key' or 'store' not sent`)
  next()
}

const createLocalRecord = (request, response, next) => {
  const { key, store } = request.body;
  KeyStore.create({key, store})
    .then(keystore => {
      request.keyStoreId = keystore._id
      KeyStoreHistory.findOne({key})
        .then(doc => {
          if(!doc) {
            const merkleRoot = merkleTree.createRoot(store)
            KeyStoreHistory.create({key, merkleRoot, history: [keystore._id]})
              .then(newDoc => {
                next()
              })
          } else {
            const left = doc.merkleRoot
            const right = merkleTree.sha256(store)
            const merkleRoot = merkleTree.appendRoot(left, right)
            doc.merkleRoot = merkleRoot
            doc.history.unshift(keystore._id)
            doc.markModified('history')
            doc.save()
            next()
          }

        })
        .catch(console.log)
    })
    .catch(console.log)

}

router.post('/proof/', checkBody, createLocalRecord, (request, response) => {
  const { key, store } = request.body;
  proof.set(key, store, request.keyStoreId)
    .then(payload => {
      return successResponse(response, `CMD: set(${key}, ${store})`, {result: payload});
    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })

})

router.delete('/proof/', (request, response) => {
  const { key } = request.body;
  if(!key ) throw(`Body paramater 'key' not sent`)
  proof.remove(key)
    .then(payload => {
      return successResponse(response, `CMD: remove(${key})`, {result: payload});
    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })
})

router.get('/proof/exists/:key', (request, response) => {
    const { key } = request.params
    if(!key) throw(`Empty 'key' sent in query parameter`)
    proof.exists(key)
      .then(payload => {
        return successResponse(response, `CMD: exists(${key})`, {result: payload});
      })
      .catch(error => {
        return errorResponse(response, error.message || error);
      })
})

router.get('/proof/timestamp/:key', (request, response) => {
    const { key } = request.params
    if(!key) throw(`Empty 'key' sent in query parameter`)
    proof.timestamp(key)
      .then(payload => {
        return successResponse(response, `CMD: timestamp(${key})`, {result: parseInt(payload)});
      })
      .catch(error => {
        return errorResponse(response, error.message || error);
      })
})


// Web3 Wrapper \\

router.get('/balance/:address', (request, response) => {
  const { address } = request.params
  if(!web3.web3Http.utils.isAddress(address)) return errorResponse(response, 'Not a valid address');
  web3.web3Http.eth.getBalance(address)
    .then(balance => {
      return successResponse(response, `Address: ${address}`, balance);
    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })
})

router.get('/transaction/:hash', (request, response) => {
  const { hash } = request.params
  web3.web3Http.eth.getTransaction(hash)
    .then(transaction => {
      return successResponse(response, `Requested transaction ${hash}`, transaction)
    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })
})

router.get('/transactionReceipt/:hash', (request, response) => {
  const {hash} = request.params
  web3.web3Http.eth.getTransactionReceipt(hash)
  .then(receipt => {
    return successResponse(response, `Receipt for transaction ${hash}`, receipt)
  })
  .catch(error => {
    return errorResponse(response, error.message || error);
  })
})

router.get('/pendingTransactions', (request, response) => {
  web3.web3Http.eth.txpool.content()
    .then(txpool => {
      return successResponse(response, `Requested pending transactions`, txpool)

    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })
})


router.get('/block/:blockNumber', (request, response) => {
  const { blockNumber } = request.params
  web3.web3Http.eth.getBlock(blockNumber)
    .then(block => {
      return successResponse(response, `Requested block #${blockNumber}`, block)
    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })
})

router.get('/decode/:input', (request, response) => {
  const { input } = request.params
  const decoder = new InputDataDecoder(proof.abi);
  const result = decoder.decodeData(input)
  return successResponse(response, 'Decoded input', result)
})

router.get('/contract', (request, response) => {
  invoice.readContract('invoice')
    .then(contract => {
      const decoder = new InputDataDecoder(contract.abi);
      return successResponse(response, 'Decoded Contract', decoder)
    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })
})

router.get('/hash/:hash', (request, response) => {
  const {hash} = request.params
  invoice.getFromBlockchain(hash)
    .then(payload => {
      return successResponse(response, 'Retrieved from blockchain', payload)
    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })
})

router.get('/isHash/:hash', (request, response) => {
  const { hash } = request.params
  invoice.existsOnBlockchain(hash)
    .then(payload => {
      return successResponse(response, `Check if ${hash} exists`, payload);
    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })
})

router.post('/hash', (request, response) => {
  const { invoiceId, hash } = request.body;
  invoice.storeOnBlockchain(invoiceId, hash)
    .then(payload => {
      return successResponse(response, `Stored Invoice ID: '${invoiceId}' with hash '${hash}'`, payload);
    })
    .catch(error => {
      return errorResponse(response, error.message || error);
    })
})



router.post('/deploy/contract/proof', (request, response) => {
        const encodedABI = proof.contract.deploy({ data : proof.bytecode}).encodeABI()
        Promise.all([
          web3.web3Http.eth.getGasPrice(),
          web3.web3Http.eth.getBalance(process.env.PUBLIC_KEY),
          web3.web3Http.eth.getTransactionCount(process.env.PUBLIC_KEY, 'pending')
        ])
        .then(data => {
          const gasPrice = data[0]
          const balance = data[1]
          const nonce = data[2]
          const transactionParams = {
            nonce,
            gasPrice: web3.web3Http.utils.toHex(gasPrice),
            gasLimit: '0x47b760',
            from: this.publicKey,
            value: web3.web3Http.utils.toHex(0),
            data: encodedABI,
          }
          web3.web3Http.eth.accounts.signTransaction(transactionParams, process.env.PRIVATE_KEY)
            .then(signedTransaction => {
              web3.web3Http.eth.sendSignedTransaction(signedTransaction.rawTransaction)
                .then(receipt => {
                  console.log(receipt);
                })
                .catch(error => {
                  console.log(error);
                })
            })
            .catch(error => {
              console.log(error);
            })
        })
        .catch(error => {
          console.log(error);
        })
    })


module.exports = router;
