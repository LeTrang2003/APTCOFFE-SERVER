const mongoose = require("mongoose");
const TableSchema = new mongoose.Schema({
  name: String,
  idProduct: [String],
  status: Number,
});

const Table = mongoose.model("Table", TableSchema);
module.exports = Table;
