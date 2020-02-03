let express = require('express');
let router = express.Router();
let config = require('./config'); 
let User = require('./api/models/UserModel');
let jwt = require('jsonwebtoken');

router.post('/user', function (req, res, next)
    {
        jwt.verify(req.headers.token, config.secret, function (err, decoded){
          if (err){
             next();
        } else 
            {
                User.findById(decoded.id, function(error, user) {
                  res.json({success: true,  message: user});
                  next();
            })
        }
        })
    }
);

module.exports = router;
