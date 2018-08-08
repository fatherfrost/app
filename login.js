var express = require('express');
var router = express.Router();
var config = require('./config'); 
var User = require('./app/models/user');
var jwt = require('jsonwebtoken');
var error = require('./errors');

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
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }

        }

    });
});

module.exports = router;

