const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

var schema = mongoose.Schema({
    name: String,
    email: String,
    password: String,
    role: String,
    staffStatus: { type: String, default: 'active' },
    whatsappTemplate: String
});

schema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        return enteredPassword === this.password;
    }
    return await bcrypt.compare(enteredPassword, this.password);
};

schema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }
    if (this.password && !this.password.startsWith('$2a$') && !this.password.startsWith('$2b$')) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
});

var userModel = mongoose.model("user", schema);
module.exports = userModel;
