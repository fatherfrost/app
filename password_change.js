var express = require('express');
var router = express.Router();
var config = require('./config'); 
var User = require('./app/models/user');
var error = require('./errors');
var jwt = require('jsonwebtoken'); 

router.post('/password_change?:t', auth,  function(req, res){ 
    if (req.body.passwordNew && req.body.passwordNewConf){    
            if (req.body.passwordNew === req.body.passwordNewConf)
            {
                console.log(req.body.passwordNew);
                req.active_user.password = req.body.passwordNew;
                req.active_user.save();
                res.json({success: true, message: 'Password changed.'})
            }
            else res.json({message:'Passwords not equal'});
        }
        else res.json({message: 'No password '});

        });
        

function auth (req, res, next) {
    jwt.verify(req.query.t, config.secret, function (err, decoded){
        if (err){
            res._end(new error(err.message, error.LOGIN_TIME_OUT, error.CODE.INVALID_TOKEN));
            next();
      } else 
          {
              User.findById(decoded.id, function(error, user) {
                req.active_user = user;
                next();
               })
          }
      })    
}

module.exports = router;