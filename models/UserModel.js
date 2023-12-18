const mongoose = require('mongoose')
const UserSchema = new mongoose.Schema({
    email: String,
    username: String,
    password: String,
    avatar: String,
    rank: String
});

const User = mongoose.model("Users", UserSchema);
module.exports = User;