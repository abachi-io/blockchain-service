const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KeyStoreSchema = new Schema({
  key: String,
  store: String,
  transactionHash: {type: String, default: ""},
  success: {type: Boolean, default: false},
});

KeyStoreSchema.set('timestamps', true)

module.exports = mongoose.model('KeyStore', KeyStoreSchema);
