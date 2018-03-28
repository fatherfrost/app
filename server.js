var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken'); 
var config = require('./config'); 
var User = require('./app/models/user');
var error = require('./errors');
var nodemailer = require('nodemailer');

var port = process.env.PORT || 8080; 
mongoose.connect(config.database); 
app.set('secret', config.secret);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use((req, res, next) => {
    res._end = (obj, statusCode) => {
        if (!obj) {
            obj = {};
        }
        statusCode = statusCode || 200;

        if (obj instanceof Error || obj.statusCode) {
            // logger.error(obj);

            const ServiceError = require('./errors');
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

var create = require('./create');
app.post('/create', create);

var profile = require('./user');
app.post('/user', profile);

var login = require('./login');
app.post('/login', login);

var edit = require('./edit');
app.post('/edit', edit);

var mail = require('./mail');
app.post('/mail', mail);

var restore = require('./restore');
app.post('/restore', restore);

var reset = require('./reset');
app.post('/reset/:resetToken', reset);

var password_change = require('./password_change');
app.post('/password_change?:t', password_change);

app.listen(port);
console.log('Server started: http://localhost:' + port);


