var mongoose = require('mongoose');
//var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var User = new Schema({
    name: {type: String, unique:true },
    password: String,
    passwordConf: String,
    //admin: Boolean
});

/*User.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.hash_password);
};*/

module.exports =  mongoose.model('User', User)