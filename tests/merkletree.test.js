const MerkleTree = require('../components/MerkleTree')
const merkleTree = new MerkleTree()


test('SHA256(`1`) should equal `6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b`', () => {
  expect(merkleTree.sha256('1')).toBe('6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b')
})

test('SHA256(`1`), then append SHA(`2`) should equal `33b675636da5dcc86ec847b38c08fa49ff1cace9749931e0a5d4dfdbdedd808a`', () => {
  const merkleRoot = merkleTree.createRoot('1')
  const newMerkleRoot = merkleTree.appendRoot(merkleRoot, merkleTree.sha256('2'))
  expect(newMerkleRoot).toBe('33b675636da5dcc86ec847b38c08fa49ff1cace9749931e0a5d4dfdbdedd808a')
})

test('start with `1`, then append `2` should equal `33b675636da5dcc86ec847b38c08fa49ff1cace9749931e0a5d4dfdbdedd808a`', () => {
  const merkleRoot = merkleTree.createRoot('1')
  const newMerkleRoot = merkleTree.appendRoot(merkleRoot, merkleTree.sha256('2'))
  expect(newMerkleRoot).toBe('33b675636da5dcc86ec847b38c08fa49ff1cace9749931e0a5d4dfdbdedd808a')
})

test('start with `1`, append `2`, then append `3` should equal `201c46820e0cb1a0bbc6bf843d1dc7d85396f633ce52200ad25bc4e95473a322`', () => {
  let merkleRoot = merkleTree.createRoot('1')
  merkleRoot = merkleTree.appendRoot(merkleRoot, merkleTree.sha256('2'))
  let newMerkleRoot = merkleTree.appendRoot(merkleRoot, merkleTree.sha256('3'))
  expect(newMerkleRoot).toBe('201c46820e0cb1a0bbc6bf843d1dc7d85396f633ce52200ad25bc4e95473a322')
})

test('Start with an array of hashes, get Merkle root, should equal 201c46820e0cb1a0bbc6bf843d1dc7d85396f633ce52200ad25bc4e95473a322', () => {
  const hashes = ['6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b', 'd4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35', '4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce']
  const merkleRoot = merkleTree.getRoot(hashes)
  console.log(merkleRoot)
  expect(merkleRoot).toBe('201c46820e0cb1a0bbc6bf843d1dc7d85396f633ce52200ad25bc4e95473a322')
})
