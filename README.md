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

### Run without Docker

`node index`

## Run with Docker

You are now ready to build the application image using the docker build command. Using the `-t` flag with docker build will allow you to tag the image with a memorable name. We will tag the image as `blockchain-service`, but feel free to replace this with a name of your own choosing.

`docker build -t blockchain-service .`

The **.** specifies that the build context is the current directory.

It will take a minute or two to build the image. Once it is complete, check your images:


`docker images`

You will see the following output:


```
REPOSITORY                   TAG                 IMAGE ID            CREATED             SIZE
blockchain-service           latest              fc71c1ef9105        8 seconds ago       1.03GB
node                         10-alpine           f09e7c96b6de        3 weeks ago         70.7MB
```

It is now possible to create a container with this image using docker run. We will include three flags with this command:

* `-p`: This publishes the port on the container and maps it to a port on our host. We will use port 80 on the host, but you should feel free to modify this as necessary if you have another process running on that port. For more information about how this works, see [this discussion](https://docs.docker.com/v17.09/engine/userguide/networking/default_network/binding/) in the Docker docs on port binding.
* `-d`: This runs the container in the background.
* `--name`: This allows us to give the container a memorable name.
Run the following command to build the container:

`docker run --name blockchain-service -p 80:9899 -d blockchain-service`

Once your container is up and running, you can inspect a list of your running containers with docker ps:

`docker ps`

```
CONTAINER ID        IMAGE                                                   COMMAND             CREATED             STATUS              PORTS                  NAMES
e50ad27074a7        blockchain-service              "node index.js"       8 seconds ago       Up 7 seconds        0.0.0.0:80->8080/tcp   nodejs-image-demo
```





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
