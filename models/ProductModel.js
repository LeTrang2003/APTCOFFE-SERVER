const mongoose = require('mongoose')
const ProductSchema = new mongoose.Schema({
    name: String,
    price: Number,
    company: String,
    avatar: String,
});

const Product = mongoose.model("Products", ProductSchema);
module.exports = Product;