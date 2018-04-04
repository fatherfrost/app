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
//var auth = require('./auth');
var cookieParser = require('cookie-parser');
var cookieSession = require('cookie-session');
const webPush = require('web-push');
var FCM = require('fcm-node');
var serverKey = 'AIzaSyD5wdhtTVf5VaBOwMntWwkvMrnF1ZipZP4';
var fcm = new FCM(serverKey);

var port = process.env.PORT || 8080; 
mongoose.connect(config.database); 
app.set('secret', config.secret);
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

//auth(passport);

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

/*app.get('/auth/google', passport.authenticate('google', {
scope: ['https://www.googleapis.com/auth/userinfo.profile']
}));*/

/*app.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect:'/'}),
    (req, res) => {
        let generateToken = Math.random().toString();
        var token = generateToken + generateToken;
        req.session.token = token;
        res.redirect('/');
    }
);*/

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
})

let vapidKeys = {
    publicKey: 'BKsiyEqqfmsT8GSWikxEqnxBuII8KmG0Acf_QqISXkMUdOZLSj3tJKdw0J2Z5Bx02vccGYSLqiieujW_-PZL5_o',
    privateKey: '8dCXtKcSCP51OBUeXuwACPsLMIN3eyYirDClbOUPFQA'
  };
  webPush.setGCMAPIKey('AIzaSyD5wdhtTVf5VaBOwMntWwkvMrnF1ZipZP4');
  
  // Tell web push about our application server
  webPush.setVapidDetails('mailto:email@domain.com', vapidKeys.publicKey, vapidKeys.privateKey);

  app.post('/push', function (req, res) {
    User.findOne({name: req.body.name}, function(err, user){
        if (err) throw err;
        var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
            to: 'AAAAXEpaolo:APA91bExftBUrA-MrcEh65lmCI2MOzuWaUzsdUzM-Q9OtAi9XvrApIEuqurZLdknXoyBDUdaDNdYh_U550SBdnRWuN2T9Tp4a9kPdraYOXIwFroUsvJn_R_hSm5TqiYJ83SQAAbe1_63', 
            
            notification: {
                title: 'LEEEROY', 
                body: 'JEEENKINS' 
            },
        };
        
        fcm.send(message, function(err, response){
            if (err) {
                console.log("Something has gone wrong!", err);
            } else {
                console.log("Successfully sent with response: ", response);
            }
        });
    })})

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


