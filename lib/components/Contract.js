const dotenv = require('dotenv').config()
const fs = require('fs')
const path = require('path');
const solc = require('solc');
const shell = require('shelljs');

class Contract {

  compile(contract) {
    console.log(`Compiling ${contract}.sol`)
    const cmd = `solc --overwrite --gas --bin --abi --optimize-runs=200 -o ./lib/contracts/ ./lib/contracts/${contract}.sol`
    const output = shell.exec(cmd, {async:true})
    output.stdout.on('data', console.log);
  }

  compileManually(contract) {
    return new Promise((resolve, reject) => {
      try {
        const file = `${contract}.sol`
        const path = `./lib/contracts/${file}`
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


}

module.exports = Contract;
