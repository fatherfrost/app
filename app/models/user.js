var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var User = new Schema({
    name: String,
    password: String
});

module.exports =  mongoose.model('User', User)