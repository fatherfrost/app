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

router.post('/restore', function(req, res)
{
    var transporter = nodemailer.createTransport( {
        service:  'Mailgun',
        auth: {
         user: 'postmaster@sandbox55d085e6ab9d4b5eac48c666504f31b2.mailgun.org',
         pass: '014e97450d5d0a6d07fef9f04f280532-21e977f8-ac882a8d'   
        }
    });

    User.findOne({mail:req.body.mail}, function(err, user){
        if (err) throw err;
        if (user){
            if (user.mail){{
                const payload = {
                    id: user._id,   
                };
                var token = jwt.sign(payload, req.app.get('secret'), {
                    expiresIn: "1h"
                });
                var link = 'http://localhost:8080/password_change?t=' + token;
                res.json({
                    success: true
                    //message: link,
                });
                }                  
                let mailOptions = {
                    from: 'Login admin', 
                    to: user.mail, 
                    subject: 'Password restore', 
                    text: 'Follow the link to reset your password: ' + link + '. Link expires in 24 hours.', 
                }
                {
                transporter.sendMail(mailOptions, function(err, info)
                    { 
                        if (err) console.log(err);
                        console.log('Message sent: %s', info.messageId);
                    });
                }
                //res.json({success: true, message: 'Message sent'});
                }
                else
                    res._end(new error('This account do not has email', error.STATUS.INTERNAL_SERVER_ERROR, error.CODE.INVALID_FORGOT_EMAIL_EMPTY));
                }
                else 
                res._end(new error('User not found', error.STATUS.INTERNAL_SERVER_ERROR, error.CODE.ERROR_USER_NOT_FOUND));
                }
            )

        }    
    )
module.exports = router;