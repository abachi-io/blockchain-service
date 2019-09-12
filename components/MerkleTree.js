const crypto = require("crypto");

class MarkelTree {

  sha256(data) {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  createRoot(data) {
    return this.sha256(data);
  }

  appendRoot(left, right) {
    return this.sha256(`${left}${right}`);
  }

  compare(left, right) {
    if(!left) throw new Error("The concat function expects two hash arguments, the first was not receieved.");
    if(!right) throw new Error("The concat function expects two hash arguments, the second was not receieved.");
    return left === right ? true : false
  }

  getRoot(layers, newArr = []) {
      if(!layers) throw new Error("The getRoot function expects one array arguments");
      if (layers.length === 1) return layers[0];
      for (let i = 0; i < layers.length; i += 2) {
        let left = layers[i]
        let right = layers[i+1]
          if (right) {
              newArr.push(this.concatHash(left, right))
          } else {
              newArr.push(layers[i])
          }
      }
      return this.getRoot(newArr)
    }

  concatHash(left, right) {
    if(!left) throw new Error("The concat function expects two hash arguments, the first was not receieved.");
    if(!right) throw new Error("The concat function expects two hash arguments, the second was not receieved.");
    return sha256(`${left}${right}`);
  }

  hashProof(node, proof) {
    let data = this.sha256(node);
    for (let i = 0; i < proof.length; i++) {
        const buffers = (proof[i].left) ? [proof[i].data, data] : [data, proof[i].data];
        data = this.sha256(Buffer.concat(buffers));
    }
    return data;
  }

  getRoot(layers, newArr = []) {
      if(!layers) throw new Error("The getRoot function expects one array arguments");
      if (layers.length === 1) return layers[0];
      for (let i = 0; i < layers.length; i += 2) {
        let left = layers[i]
        let right = layers[i+1]
          if (right) {
              newArr.push(this.concatHash(left, right))
          } else {
              newArr.push(layers[i])
          }
      }
      return this.getRoot(newArr)
    }

    // verifyProof(proof, node, root, concat) {
    //    for(let i=0; i<proof.length; i++) {
    //        let {left, data} = proof[i]
    //        if(left) {
    //            node = concat(data, node)
    //        } else {
    //            node = concat(node, data)
    //        }
    //    }
    //    return node.equals(root)
    // }


}

module.exports = MarkelTree
