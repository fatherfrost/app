var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var UserController = require('./api/controllers/UserController.js');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken');
var passport = require('passport');
var config = require('./config');

var port = process.env.PORT || 8080; 
mongoose.connect(config.database); 
app.set('secret', config.secret);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(passport.initialize());

app.use((req, res, next) => {
    res._end = (obj, statusCode) => {
        if (!obj) {
            obj = {};
        }
        statusCode = statusCode || 200;

        if (obj instanceof Error || obj.statusCode) {
            const ServiceError = require('./api/helpers/errors');
            if (!(obj instanceof ServiceError)) {
                obj = new ServiceError(obj);
            }

            res.statusCode = obj.statusCode;
            let response = {
                success: false,
                message: obj.message,
                errorCode: obj.errorCode,
                errorStack: obj.errors
            };

            res.json(response);
            return;
        }

        if (req.user) {
            if (!req.user.loanOfficerRole) {
                let token = jwt.sign({id: req.user.id}, process.env.JWT_SECRET, {
                    expiresIn: 1800
                });
                res.set('token-refresh', token);
            }
        }

        res.statusCode = statusCode;

        res.json({
            success: statusCode >= 200 && statusCode <= 299,
            code: 1,
            data: obj
        });
    };
    next();
});

app.post('/registration', UserController);

app.post('/login', UserController);

app.post('/password/new', UserController);

app.post('/remind', UserController);

app.post('/restore', UserController);

app.post('/reset/:resetToken', UserController);

app.post('/password/change?:t', UserController);

var profile = require('./user');
app.post('/user', profile);

app.listen(port);
console.log('Server started: http://localhost:' + port);


