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