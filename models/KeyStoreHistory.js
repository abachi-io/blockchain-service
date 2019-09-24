const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const KeyStoreHistorySchema = new Schema({
  key: String,
  merkleRoot: String,
  history: Array
});

KeyStoreHistorySchema.set('timestamps', true)

module.exports = mongoose.model('KeyStoreHistory', KeyStoreHistorySchema);
