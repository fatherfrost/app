var express = require('express');
var router = express.Router();
var config = require('./config'); 
var User = require('./app/models/user');
var jwt = require('jsonwebtoken');
var error = require('./errors');
var bodyParser = require('body-parser');

router.post('/edit', auth, function (req, res)
    {
        let user = req.user;
        if (user.password != req.body.password) {
            res._end(new error('Password not correct.', error.NOT_AUTHORIZED, error.CODE.INVALID_AUTHORIZATION_PASSWORD));
        } else {
            if( req.body.passwordNew === req.body.passwordNewConf) {
                user.password = req.body.passwordNew;
                user.save((err) => {
                    if (err) return res._end(new error('Password not correct.', error.NOT_AUTHORIZED, error.CODE.INVALID_AUTHORIZATION_PASSWORD));
                    res.json('Changed');
                });
                
            }
        }
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
        
module.exports = router;
