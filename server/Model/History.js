const mongoose = require('mongoose')

var schema = mongoose.Schema({
    staffId: String,
    staffName: String,
    action: String,
    date: { type: Date, default: Date.now }
})

var historyModel = mongoose.model("history", schema)
module.exports = historyModel
