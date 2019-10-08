const axios = require('axios')

const key = 'keyspam'
var store = 1
let responses = []


function ping() {
  return new Promise( (resolve, reject) => {
    axios.get(`http://localhost:9899`)
      .then(response => {
        if(response.data.success) return resolve();
        return reject();
      })
      .catch(reject)
  })
}


function spamSetKey(store, i = 1000) {
  return new Promise( (resolve, reject) => {
    console.log(key, store)
    axios.post(`http://localhost:9899/api/proof`, {
      key,
      store: `${store}`
    })
      .then(response => {
        console.log(response.data.data)
        let newI = i - 1
        let newStore = store+1
        if(newI > 0) {
          return spamSetKey(newStore, newI)
        } else {
          resolve('done')
        }
      })
      .catch(reject)
  })
}

spamSetKey(store)
  .then(console.log)
  .catch(console.log)
