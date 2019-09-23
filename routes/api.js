const dotenv = require('dotenv').config();
const express = require('express');
const router = express.Router();
const Web3 = require('../components/Web3')
const web3 = new Web3()
const Invoice = require('../components/Invoice')
const invoice = new Invoice(web3)
const Contract = require('../components/Contract')
const contract = new Contract()
const Proof = require('../components/Proof')
const proof = new Proof(web3)
const InputDataDecoder = require('ethereum-input-data-decoder');
const axios = require('axios')
const mongoose = require('mongoose');
const chalk = require('chalk')

let mongod = undefined;
mongoose.connect('mongodb://127.0.0.1/lucaHash', { useNewUrlParser: true });
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
  web3.web3Http.eth.txpool.status()
    .then(txpool => {
      return successResponse(response, 'Health Check', {
        endpoint: true,
        geth: true,
        mongod,
        txpool: {
          pending: parseInt(txpool.pending, 16) || 0,
          qued: parseInt(txpool, 16) || 0
        }
      });
    })
    .catch(error => {
      return successResponse(response, 'Health Check', {
        endpoint: true,
        geth: false,
        mongod,
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

router.post('/proof/', (request, response) => {
  const { key, store } = request.body;
  if(!key || !store) throw(`Body paramater 'key' or 'store' not sent`)
  proof.set(key, store)
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



router.get('/deploy/contract', (request, response) => {
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
