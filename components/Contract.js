const dotenv = require('dotenv').config()
const fs = require('fs')
const path = require('path');
const solc = require('solc');

class Contract {
  compile(contract) {
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


}

module.exports = Contract;
