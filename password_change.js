var express = require('express');
var router = express.Router();
var config = require('./config'); 
var User = require('./app/models/user');
var error = require('./errors');
var jwt = require('jsonwebtoken'); 

router.post('/password_change', auth, function(req, res){
        if(req.user)
        {
            if (req.body.password === req.body.passwordConf)
            {
                req.user.password = req.body.password;
                req.user.save();
                res.json({success: true, message: 'Password changed.'})
            }
        }
        else res._end(new error('User not found.', error.STATUS.NOT_AUTHORIZED, error.CODE.INVALID_AUTHORIZATION_USERNOTFOUND));
        })

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
module.exports = router;