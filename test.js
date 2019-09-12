const MerkleTree = require('./components/MerkleTree')
const merkleTree = new MerkleTree()
const crypto = require('crypto')

const rootHash = merkleTree.createRoot('1')
console.log(rootHash)
// console.log(merkleTree.createRoot(merkleTree.sha256('2')).toString())
const appendRoot = merkleTree.appendRoot(merkleTree.sha256('2'), rootHash)
console.log(appendRoot)

let newRoot = ''
let history = []
const rootHash = merkleTree.createRoot('0')
history.push(rootHash)
for(let i=1; i<10; i++) {
  newRoot = merkleTree.appendRoot(merkleTree.sha256(`${i}`), rootHash)
  history.push(newRoot)
}

console.log(newRoot)
console.log(history)


console.log( merkleTree.getRoot(history))
