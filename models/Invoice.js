const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const invoiceSchema = new Schema({
  invoiceId: String,
  merkelRoot: String,
  history: Array
});

userSchema.set('timestamps', true)

module.exports = mongoose.model('Invoice', invoiceSchema);
