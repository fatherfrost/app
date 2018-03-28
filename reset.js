var express = require('express');
var router = express.Router();
var config = require('./config'); 
var User = require('./app/models/user');
var jwt = require('jsonwebtoken');
var error = require('./errors');
var nodemailer = require('nodemailer');
var User = require('./app/models/user');
var error = require('./errors');
var moment = require('moment');

router.post('/reset/:resetToken', function(req, res)
{
    var transporter = nodemailer.createTransport( {
        service:  'Mailgun',
        auth: {
         user: 'postmaster@sandbox55d085e6ab9d4b5eac48c666504f31b2.mailgun.org',
         pass: '014e97450d5d0a6d07fef9f04f280532-21e977f8-ac882a8d'   
        }
    });

    User.findOne({resetPasswordToken: req.params.resetToken, resetPasswordExpires: {$gt: Date.now()}}, function(err, user){
        if (err) throw err;
        if (user){
            if (user.resetPasswordToken){
                const payload = {
                    id: user._id,
                };
                var token = jwt.sign(payload, req.app.get('secret'), {
                    expiresIn: "1h"
                });
                var link = 'http://localhost:8080/password_change?t=' + token;
                res.json({
                    success: true,
                    message: link,
                });
            }
}
})
})
module.exports = router;