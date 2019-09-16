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

// Proof Contract \\

router.get('/proof/data/:key', (request, response) => {
    const { key } = request.params
    if(!key) throw(`Empty 'key' sent in query parameter`)
    proof.get(key)
      .then(payload => {
        return successResponse(response, `CMD: get(${key})`, payload);
      })
      .catch(error => {
        return errorResponse(response, error);
      })
})

router.post('/proof/', (request, response) => {
  const { key, store } = request.body;
  if(!key || !store) throw(`Body paramater 'key' or 'store' not sent`)
  proof.set(key, store)
    .then(payload => {
      return successResponse(response, `CMD: set(${key}, ${store})`, payload);
    })
    .catch(error => {
      return errorResponse(response, error);
    })

})

router.delete('/proof/', (request, response) => {
  const { key } = request.body;
  if(!key ) throw(`Body paramater 'key' not sent`)
  proof.remove(key)
    .then(payload => {
      return successResponse(response, `CMD: remove(${key})`, payload);
    })
    .catch(error => {
      return errorResponse(response, error);
    })
})

router.get('/proof/exists/:key', (request, response) => {
    const { key } = request.params
    if(!key) throw(`Empty 'key' sent in query parameter`)
    proof.exists(key)
      .then(payload => {
        return successResponse(response, `CMD: exists(${key})`, payload);
      })
      .catch(error => {
        return errorResponse(response, error);
      })
})

router.get('/proof/timestamp/:key', (request, response) => {
    const { key } = request.params
    if(!key) throw(`Empty 'key' sent in query parameter`)
    proof.timestamp(key)
      .then(payload => {
        return successResponse(response, `CMD: timestamp(${key})`, payload);
      })
      .catch(error => {
        return errorResponse(response, error);
      })
})


// Web3 Wrapper \\

router.get('/transaction/:hash', (request, response) => {
  const { hash } = request.params
  web3.web3Http.eth.getTransaction(hash)
    .then(transaction => {
      return successResponse(response, `Requested transaction ${hash}`, transaction)
    })
    .catch(error => {
      console.log(error)
      return errorResponse(response, error)
    })
})

router.get('/transactionReceipt/:hash', (request, response) => {
  const {hash} = request.params
  web3.eth.getTransactionReceipt(hash)
  .then(receipt => {
    return successResponse(response, `Receipt for transaction ${hash}`, receipt)
  })
  .catch(error => {
    console.log(error)
    return errorResponse(response, error)
  })

})

router.get('/pendingTransactions', (request, response) => {
  web3.web3Http.eth.getPendingTransactions()
  .then(block => {
    return successResponse(response, `${block.length}`, block)
  })
  .catch(error => {
    console.log(error)
    return errorResponse(response, error)
  })})


router.get('/block/:blockNumber', (request, response) => {
  const { blockNumber } = request.params
  web3.web3Http.eth.getBlock(blockNumber)
    .then(block => {
      return successResponse(response, `Requested block #${blockNumber}`, block)
    })
    .catch(error => {
      console.log(error)
      return errorResponse(response, error)
    })
})

router.get('/decode/:input', (request, response) => {
  const { input } = request.params
  invoice.readContract('invoice')
    .then(contract => {
      const decoder = new InputDataDecoder(contract.abi);
      const result = decoder.decodeData(input)
      return successResponse(response, 'Decoded input', result)
    })
    .catch(error => {
      return errorResponse(response, error)
    })
})

router.get('/contract', (request, response) => {
  invoice.readContract('invoice')
    .then(contract => {
      const decoder = new InputDataDecoder(contract.abi);
      return successResponse(response, 'Decoded Contract', decoder)
    })
    .catch(error => {
      return errorResponse(response, error)
    })
})

router.get('/hash/:hash', (request, response) => {
  const {hash} = request.params
  invoice.getFromBlockchain(hash)
    .then(payload => {
      return successResponse(response, 'Retrieved from blockchain', payload)
    })
    .catch(error => {
      return errorResponse(response, error)
    })
})

router.get('/isHash/:hash', (request, response) => {
  const { hash } = request.params
  invoice.existsOnBlockchain(hash)
    .then(payload => {
      return successResponse(response, `Check if ${hash} exists`, payload);
    })
    .catch(error => {
      return errorResponse(response, error);
    })
})

router.post('/hash', (request, response) => {
  const { invoiceId, hash } = request.body;
  invoice.storeOnBlockchain(invoiceId, hash)
    .then(payload => {
      return successResponse(response, `Stored Invoice ID: '${invoiceId}' with hash '${hash}'`, payload);
    })
    .catch(error => {
      return errorResponse(response, error);
    })
})


router.get('/deploy/contract/:file', (request, response) => {
  const { file } = request.params
  contract.compile(file)
    .then(data => {
      console.log(data)
      let contract = new web3.web3Http.eth.Contract(data.abi, {from: process.env.PUBLIC_KEY, gas: 47000, data: `0x${data.bytecode}`});
      return successResponse(response, '', contract)
      contract.deploy({})
        .send({}, function(error, transactionHash){ console.log })
        .on('error', function(error){ console.log })
        .on('transactionHash', function(transactionHash){ console.log })
        .on('receipt', function(receipt){
           console.log(receipt.contractAddress) // contains the new contract address
        })
        .on('confirmation', function(confirmationNumber, receipt){ console.log })
        .then(function(newContractInstance){
            console.log(newContractInstance.options.address) // instance with the new contract address
        })

      successResponse(response, `Deployed contract`, data);

    })
    .catch(error => {
      console.log(error)
      return errorResponse(response, error);
    })

})

module.exports = router;
