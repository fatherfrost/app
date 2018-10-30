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
var Session = require('express-session');
var passport = require('passport');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const webpush = require('web-push');

var port = process.env.PORT || 8080; 
mongoose.connect(config.database); 
app.set('secret', config.secret);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.use(passport.initialize());

app.post('/subscribe', function(req, res){
    User.findOne({name: req.body.name}, function(err, user){
        if(user)
        {
            console.log(user);
            user.auth = req.body.auth;
            user.p256dh = req.body.p256dh; 
            user.endpoint = req.body.endpoint;
            user.save();
            res.json({message: 'success'});
        }
    })
});

/*const vapidKeys = webpush.generateVAPIDKeys();
 
webpush.setfcmApiKey('AIzaSyD5wdhtTVf5VaBOwMntWwkvMrnF1ZipZP4');
webpush.setVapidDetails(
  'mailto:father1frost@gmail.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);
 
app.get('/push', (req, res) =>{
const pushSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/cJJEftRU9zI:APA91bE9P6OODvCLJbqfvX_K3TgmzEVbx1ZI7ktQgxKSEorruuT4FgQoN46Ov9OvEWud-iARAb6L4p1chI3dGhMmZB1WFnZ3chYbeGskUar6sD-5jWY5ULX_Il8ne3cH85pUygoCNUvQ',
  keys: {
    auth: '7CJU7A8m2oBoycnKb0eXdA==',
    p256dh: 'BO6YAUvC99luZ3wq5hxWTObWfpMqov8czoskwOd1MmWY9_q-jAzXOQnzJcZ9Tp6wNnRFw-goDQ_oqKu4w2dVY4c='
  }
};

webpush.sendNotification(pushSubscription, 'YOU FACE JARRAXXUS');
})*/

app.use((req, res, next) => {
    res._end = (obj, statusCode) => {
        if (!obj) {
            obj = {};
        }
        statusCode = statusCode || 200;

        if (obj instanceof Error || obj.statusCode) {
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

var add_action = require('./add_action');
app.post('/add_action', add_action);

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


