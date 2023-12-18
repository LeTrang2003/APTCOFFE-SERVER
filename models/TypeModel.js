const mongoose = require("mongoose");
const TypeSchema = new mongoose.Schema({
  name: String,
  image: String,
});

const Type = mongoose.model("Types", TypeSchema);
module.exports = Type;
