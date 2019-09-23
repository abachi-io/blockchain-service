# Luca Blockchain Service

## Introduction

This service is used for submitting/verifying hashes that stores in the blockchain

# API Documentation

POST MAN https://documenter.getpostman.com/view/5312272/SVfUsmZ3?version=latest
SWAGGER https://app.swaggerhub.com/apis-docs/SkyTradeInc/LucaBlockchain/1.0.0-oas3

## Getting started

### Download and install dependencies

`git clone https://github.com/SkyTradeInc/blockchain-service.git`

`cd blockchain-service`

`npm i`

Create a new file `.env`, open and add following text

```
SERVER_PORT=9899
NETWORK=
CONTRACT_ADDRESS=
PUBLIC_KEY=
PROOF_CONTRACT_ADDRESS=
PRIVATE_KEY=
```

### Run

`node index`


### Test

Go to your browser and navigate to

`http://localhost:9899/api/ping`

The server should reply back with

```javascript
{
  success: true,
  timestamp: 1568681957053,
  message: "pong",
  data: null
}
```
