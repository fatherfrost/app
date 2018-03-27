var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');
var jwt = require('jsonwebtoken'); 
var config = require('./config'); 
var User = require('./app/models/user');
var error = require('./errors');
const nodemailer = require('nodemailer');
//const mailgunTransport = require('nodemailer-mailgun-transport');

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


app.post('/mail', function (req, res) {
    var transporter = nodemailer.createTransport( {
        service:  'Mailgun',
        auth: {
         user: 'postmaster@sandbox55d085e6ab9d4b5eac48c666504f31b2.mailgun.org',
         pass: '014e97450d5d0a6d07fef9f04f280532-21e977f8-ac882a8d'   
        }
    });

    User.findOne({mail: req.body.mail}, function(err, user){
        if (err) throw err;
        let mailOptions = {
            from: 'Login admin', // sender address
            to: user.mail, // list of receivers
            subject: 'Password remind', // Subject line
            text: 'Here is your username and password ' + user.name + ' ' + user.password, // plain text body
        };
        transporter.sendMail(mailOptions, function(err, info)
            { if (err) {
                return console.log(err);
            }
            console.log('Message sent: %s', info.messageId);
        
            });
        }
    )   
});

app.listen(port);
console.log('Magic happens at http://localhost:' + port);


// Generate test SMTP service account from ethereal.email
// Only needed if you don't have a real mail account for testing
/*nodemailer.createTestAccount((err, account) => {
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
        host: 'imap.ukr.net',
        port: 993   ,
        secure: false, // true for 465, false for other ports
        auth: {
            user: 'diablo3for@ukr.net', // generated ethereal user
            pass: 'korol32k53' // generated ethereal password
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: 'diablo3for@ukr.net', // sender address
        to: 'father1frost@gmail.com', // list of receivers
        subject: 'Hello ✔', // Subject line
        text: 'Hello world?', // plain text body
        html: '<b>Hello world?</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
        // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
});
*/