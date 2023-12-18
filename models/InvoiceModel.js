const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  idTable: String,
  idProduct: [String],
  timeIn: String,
  timeOut: String,
  price: Number,
  note: String,
  dateInvoice: {
    type: Date,
    required: true,
  },
});

const Invoice = mongoose.model("Invoice", InvoiceSchema);

module.exports = Invoice;
