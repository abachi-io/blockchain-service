# Luca Blockchain Service

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
