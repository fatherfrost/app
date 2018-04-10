var express = require('express');
var router = express.Router();
var config = require('./config'); 
var User = require('./app/models/user');
var jwt = require('jsonwebtoken');
var error = require('./errors');
var bodyParser = require('body-parser');

router.post('/add_action', auth, function(req, res){
    if(req.body.taskName && req.body.deadline)
    {
     todo.push({taskName:value.req.body.taskName, deadline: value.req.body.deadline});
     res.json({message:'SUUCEEESSSSSSSSSSSSSSSSSSSSSSSS'});
    }
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
