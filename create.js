var express = require('express');
var router = express.Router();
var config = require('./config'); 
var User = require('./app/models/user');
var error = require('./errors');

router.post('/create', function (req, res) {
    console.log('req.body', req.body);
    if (req.body.mail && req.body.name && req.body.password && (req.body.passwordConf === req.body.password)) {
        var userData = new User({
            mail: req.body.mail,
            name: req.body.name,
            password: req.body.password
        });
        userData.save(function (err, user) {
            console.log(user);
            if (err) {
                res._end(new error(err.message, error.STATUS.FORBIDDEN, error.CODE.ERROR_MONGODB_SAVING));
            }

            console.log('User created', user);
            res.json({success: true, message: 'User created.'});

        });
    } else {
        if (req.body.passwordConf !== req.body.password)
        res._end(new error('Cant create user, passwords are different', error.STATUS.FORBIDDEN, error.CODE.ERROR_MONGODB_SAVING));
    }

});

module.exports = router;