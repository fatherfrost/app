var express = require('express');
var router = express.Router();
var config = require('./config'); 
var User = require('./app/models/user');
var jwt = require('jsonwebtoken');
var error = require('./errors');
var nodemailer = require('nodemailer');
var User = require('./app/models/user');
var error = require('./errors');

router.post('/mail', function (req, res) {
    var transporter = nodemailer.createTransport( {
        service:  'Mailgun',
        auth: {
         user: 'postmaster@sandbox55d085e6ab9d4b5eac48c666504f31b2.mailgun.org',
         pass: '014e97450d5d0a6d07fef9f04f280532-21e977f8-ac882a8d'   
        }
    });

    User.findOne({mail: req.body.mail}, function(err, user){
        if (err) return res._end(new error(err.message, error.STATUS.NOT_AUTHORIZED, error.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
        if (!user) res._end(new error('User not found.', error.STATUS.NOT_AUTHORIZED, error.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
        else
        {
        let mailOptions = {
            from: 'Login admin', // sender address
            to: user.mail, // list of receivers
            subject: 'Password remind', // Subject line
            text: 'Here is your username: '+ user.name + ' and password: ' + user.password , // plain text body
        };
        transporter.sendMail(mailOptions, function(err, info)
            { 
            if (err) console.log(err);
            console.log('Message sent: %s', info.messageId);
            });
        res.json({success:true, message:'Message is sent to you'})
        }
    }
    )   
});

module.exports = router;