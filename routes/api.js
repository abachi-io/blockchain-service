const express = require('express');
const router = express.Router();
const Web3 = require('../components/Web3')
const web3 = new Web3()
const Invoice = require('../components/Invoice')
const invoice = new Invoice(web3)
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

router.get('/ping', (request, response) => {
  return successResponse(response, 'pong')
})

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
  const {hash} = request.params
  invoice.existsOnBlockchain(hash)
    .then(payload => {
      return successResponse(response, `Check if ${hash} exists`, payload);
    })
    .catch(error => {
      return errorResponse(response, error);
    })
})

router.post('/hash', (request, response) => {
  const {invoiceId, hash} = request.body
  invoice.storeOnBlockchain(invoiceId, hash)
    .then(payload => {
      console.log('done, got payload')
      console.log(payload)
      return successResponse(response, `Stored Invoice ID: '${invoiceId}' with hash '${hash}'`, payload);
    })
    .catch(error => {
      return errorResponse(response, error);
    })
})

module.exports = router;
