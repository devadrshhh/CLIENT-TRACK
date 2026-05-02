const mongoose = require('mongoose')

var schema = mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    personalInfo: String,
    paymentStatus: String,
    validityStart: Date,
    validityEnd: Date,
    paymentHistory: Array,
    assignedStaff: String,
    amountDue: Number
})

var clientModel = mongoose.model("client", schema)
module.exports = clientModel
