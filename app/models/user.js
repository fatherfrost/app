var mongoose = require('mongoose');
//var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var User = new Schema({
    mail: {type: String, unique:true },
    name: {type: String, unique:true },
    password: String,
    passwordConf: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    pushToken: String,
    auth: String,
    p256dh: String,
    endpoint: String,
    taskName: String,
    deadline: Date
});

module.exports =  mongoose.model('User', User)