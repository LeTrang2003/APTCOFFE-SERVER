const mongoose = require('mongoose')
const ProductSchema = new mongoose.Schema({
    idType: String,
    name: String,
    price: Number,
    image: [String],

});

const Product = mongoose.model("Products", ProductSchema);
module.exports = Product;

