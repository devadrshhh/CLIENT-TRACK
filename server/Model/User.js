const mongoose = require('mongoose')

var schema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    staffStatus: { type: String, default: 'active' },
    whatsappTemplate: String
})

var userModel = mongoose.model("user", schema)
module.exports = userModel
