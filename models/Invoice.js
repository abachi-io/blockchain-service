const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
  invoiceId: String,
  latestHash: String,
  modified: {type: Boolean, default: false},
  history: Array
});

userSchema.set('timestamps', true)

module.exports = mongoose.model('Invoice', invoiceSchema);
