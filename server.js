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
var auth = require('./auth');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const webpush = require('web-push');

var port = process.env.PORT || 8080; 
mongoose.connect(config.database); 
app.set('secret', config.secret);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

auth(passport);

app.use(passport.initialize());

app.get('/', (req, res) => {
     {
        res.token = req.session.token;
        res.json({
            status: 'session cookie set',
        });
        res.redirect('/')
    } 
});

app.get('/logout', (req, res) => {
    req.logout();
    req.session = null;
    res.redirect('/');
});

app.use(cookieSession({
    name: 'session',
    keys: ['123']
}));
app.use(cookieParser());

app.get('/auth/google', passport.authenticate('google', {
scope: ['https://www.googleapis.com/auth/userinfo.profile']
}));

app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect:'/'}),
    (req, res) => {
        let generateToken = Math.random().toString();
        var token = generateToken + generateToken;
        req.session.token = token;
        res.redirect('/');
    }
);

app.post('/subscribe', function(req, res){
    User.findOne({name: req.body.user}, function(err, user){
        if(user)
        {
            user.auth = req.body.auth;
            user.p256dh = req.body.p256dh;
            user.endpoint = req.body.endpoint;
            user.save();
        }
    })
})


app.post('/push', function(req, res){

// VAPID keys should only be generated only once.
const vapidKeys = webpush.generateVAPIDKeys();

webpush.setGCMAPIKey('<Your GCM API Key Here>');
webpush.setVapidDetails(
  'mailto:example@yourdomain.org',
  vapidKeys.publicKey,
  vapidKeys.privateKey
)

// This is the same output of calling JSON.stringify on a PushSubscription
const pushSubscription = {
  endpoint: req.body.endpoint,
  keys: {
    auth: '.....',
    p256dh: '.....'
  }
};
webpush.sendNotification(pushSubscription, 'Your Push Payload Text');

})

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


