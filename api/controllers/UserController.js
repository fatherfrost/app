var express = require('express');
var router = express.Router();
var User = require('../models/UserModel');
var error = require('../helpers/errors');
var jwt = require('jsonwebtoken');
var nodemailer = require('nodemailer');

module.exports = router;

router.post('/registration', function (req, res) {
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
            res._end({success: true, user: userData});
        });
    } else {
        if (req.body.passwordConf !== req.body.password)
            res._end(new error('Cant create user, passwords are different', error.STATUS.FORBIDDEN, error.CODE.ERROR_MONGODB_SAVING));
    }
});


router.post('/login', function (req, res) {
    User.findOne({
        name: req.body.name
    }, function (err, user) {
        if (err) return res._end(new error(err.message, error.STATUS.NOT_AUTHORIZED, error.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));

        if (!user) {
            res._end(new error('User not found.', error.STATUS.NOT_AUTHORIZED, error.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
        } else if (user) {
            if (user.password != req.body.password) {
                res._end(new error('Password not correct.', error.NOT_AUTHORIZED, error.CODE.INVALID_AUTHORIZATION_PASSWORD));
            } else {
                const payload = {
                    id: user._id,
                };
                var token = jwt.sign(payload, req.app.get('secret'), {
                    expiresIn: "15m"
                });
                res._end({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token,
                    user: user
                });
            }
        }
    });
});

router.post('/password/new', auth, function (req, res) {
    let user = req.user;
    if (user.password !== req.body.password) {
        res._end(new error('Password not correct.', error.NOT_AUTHORIZED, error.CODE.INVALID_AUTHORIZATION_PASSWORD));
    } else {
        if(req.body.passwordNew === req.body.passwordNewConf) {
            user.password = req.body.passwordNew;
            user.save((err) => {
                if (err) return res._end(new error('Password not correct.', error.NOT_AUTHORIZED, error.CODE.INVALID_AUTHORIZATION_PASSWORD));
                res.json('Changed');
            });
        }
    }
});

router.post('/remind', function (req, res) {
    var transporter = nodemailer.createTransport( {
        service:  'Mailgun',
        auth: {
            user: 'postmaster@sandbox55d085e6ab9d4b5eac48c666504f31b2.mailgun.org',
            pass: '014e97450d5d0a6d07fef9f04f280532-21e977f8-ac882a8d'
        }
    });

    User.findOne({mail: req.body.mail}, function(err, user) {
        if (err) return res._end(new error(err.message, error.STATUS.NOT_AUTHORIZED, error.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
        if (!user) res._end(new error('User not found.', error.STATUS.NOT_AUTHORIZED, error.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
        else {
            let mailOptions = {
                from: 'Login admin',
                to: user.mail,
                subject: 'Password remind',
                text: 'Here is your username: '+ user.name + ' and password: ' + user.password ,
            };
            transporter.sendMail(mailOptions, function(err, info) {
                if (err) console.log(err);
                console.log('Message sent: %s', info.messageId);
            });
            res.json({success:true, message:'Message is sent to you'})
        }
    })
});

router.post('/password/change', auth,  function(req, res){
    if (req.body.passwordNew && req.body.passwordNewConf){
        if (req.body.passwordNew === req.body.passwordNewConf)
        {
            console.log(req.body.passwordNew);
            req.active_user.password = req.body.passwordNew;
            req.active_user.save();
            const payload = {
                id: user._id,
            };
            var token = jwt.sign(payload, req.app.get('secret'), {
                expiresIn: "1h"
            });
            res.json({success: true, message: 'Password changed.'});
        }
        else res.json({message:'Passwords not equal'});
    }
    else res.json({message: 'No password '});
});

router.post('/reset/:resetToken', function(req, res)
{
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
                var link = 'http://localhost:4200/password_change?t=' + token;
                res.json({
                    success: true,
                    message: link,
                });
            }
        }
    })
});

router.post('/restore', function(req, res) {
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
                var link = 'http://localhost:4200/password_change?t=' + token;
                res.json({
                    success: true
                    //message: link,
                });
            }
                let mailOptions = {
                    from: 'Login admin',
                    to: user.mail,
                    subject: 'Password restore',
                    text: 'Follow the link to reset your password: ' + link + '. Link expires in 1 hour.',
                };
                {
                    transporter.sendMail(mailOptions, function(err, info)
                    {
                        if (err) console.log(err);
                        console.log('Message sent: %s', info.messageId);
                    });
                }
            } else
                res._end(new error('This account do not has email', error.STATUS.INTERNAL_SERVER_ERROR, error.CODE.INVALID_FORGOT_EMAIL_EMPTY));
        } else
            res._end(new error('User not found', error.STATUS.INTERNAL_SERVER_ERROR, error.CODE.ERROR_USER_NOT_FOUND));
    })
});

function auth (req, res, next) {
    jwt.verify(req.headers.token, config.secret, function (err, decoded){
        if (err){
            res._end(new error(err.message, error.LOGIN_TIME_OUT, error.CODE.INVALID_TOKEN));
            next();
        } else
        {
            console.log(req.headers);
            User.findById(decoded.id, function(error, user) {
                req.user = user;
                next();
            })
        }
    })
}