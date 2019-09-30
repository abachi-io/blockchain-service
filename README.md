# Luca Blockchain Service

## Introduction

This service is used for storing/retrieving hashes on the Ledgerium blockchain.

### How it works

#### Traditional Merkle Tree

![Merkle Tree](documentation/merkleTree.png?raw=true "Merkle Tree")

Merkle trees are a fundamental part of blockchain technology. A merkle tree is a structure that allows for efficient and secure verification of content in a large body of data. 

* Data - Raw string
* Leaves - `SHA-256` hash of data
* Nodes - `SHA-256` hash of previous 2 leaves
* Merkle Root - `SHA-256` hash of last 2 nodes

#### Modified Concept

![Merkle Chain](documentation/merkleChain.png?raw=true "Merkle Chain")


We have used a modified version of the merkle tree to create a merkle chain.



## API Documentation

* [Postman](https://documenter.getpostman.com/view/5312272/SVfUsmZ3?version=latest)

* [Swagger](https://app.swaggerhub.com/apis-docs/SkyTradeInc/LucaBlockchain/1.0.0-oas3)

## Prerequisites

* [NodeJS](https://nodejs.org/en/)
* [NPM](https://www.npmjs.com/get-npm)

**OR**

* [Docker](https://www.docker.com/get-started)

## Getting started

### Download

Clone the repository to your computer

```
git clone https://github.com/ledgerium/blockchain-service.git
```

Navigate into the cloned directory

```
cd blockchain-service
```

### Create environment variables


Create a file, `.env`, open and add the following:


```
WEB3_HTTP=http://toorak.ledgerium.io:8545/10/
PROOF_CONTRACT_ADDRESS=0xEFA87544B7a6975c715f94905697B854ed28B9A8
PUBLIC_KEY=
PRIVATE_KEY=
```

You are responsible for filling the following your own XLG wallet keys, e.g:
* `PUBLIC_KEY=0x72Be32dF0c8d971eaD475C557345eF2551abBE99`
* `PRIVATE_KEY=dfab1616fe38bab80e6c935119f8e3047443c07037b98450bc35beec8bd98759`

Optional:
* `SERVER_PORT=9899`
* `TRANSACTION_TIMEOUT=10000`

### Run without Docker

You need to install the package dependencies

```
npm install
```

Run the application

```
node index
```

You will see the following output:

```
[+] Listening on port: 9899
```


### Run with Docker

You are now ready to build the application image using the docker build command. Using the `-t` flag with docker build will allow you to tag the image with a memorable name. We will tag the image as `blockchain-service`, but feel free to replace this with a name of your own choosing.

```
docker build -t blockchain-service .
```


The **.** specifies that the build context is the current directory.

It will take a minute or two to build the image. Once it is complete, check your images:


```
docker images
```


You will see the following output:


```
REPOSITORY                   TAG                 IMAGE ID            CREATED             SIZE
blockchain-service           latest              fc71c1ef9105        8 seconds ago       1.03GB
node                         10-alpine           f09e7c96b6de        3 weeks ago         70.7MB
```

It is now possible to create a container with this image using docker run. We will include three flags with this command:

* `-p`: This publishes the port on the container and maps it to a port on our host. We will use port 9899 on the host, but you should feel free to modify this as necessary if you have another process running on that port. For more information about how this works, see [this discussion](https://docs.docker.com/v17.09/engine/userguide/networking/default_network/binding/) in the Docker docs on port binding.

* `-d`: This runs the container in the background.

* `--name`: This allows us to give the container a memorable name.
Run the following command to build the container:

```
docker run --name blockchain-service -p 9899:9899 -d blockchain-service
```


Once your container is up and running, you can inspect a list of your running containers with docker ps:

```
docker ps
```

You will see the following output:


```
CONTAINER ID       IMAGE                   COMMAND             CREATED           STATUS           PORTS                  NAMES
ae8b4b8952bc       blockchain-service      "node index.js"     8 seconds ago     Up 7 seconds     0.0.0.0:9899->9899/tcp   blockchain-service
```

### Test

Go to your browser and navigate to

```
http://localhost9899/api/ping
```


Expected output:

```javascript
{
  success: true,
  timestamp: 1568681957053,
  message: "pong",
  data: null
}
```

## How to Contribute

1. Clone the repo and create a new branch
2. Make intended changes and test thoroughly  
3. Submit a PR (pull request) with a comprehensive description of changes
