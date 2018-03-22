var mongoose = require('mongoose');
//var bcrypt = require('bcrypt');
var Schema = mongoose.Schema;

var User = new Schema({
    name: String,
    password: String,
    admin: Boolean
});

/*User.methods.comparePassword = function(password){
    return bcrypt.compareSync(password, this.hash_password);
};*/

module.exports =  mongoose.model('User', User)