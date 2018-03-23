var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var mongoose = require('mongoose');

var jwt = require('jsonwebtoken'); // used to create, sign, and verify tokens
var config = require('./config'); // get our config file
var User = require('./app/models/user'); // get our mongoose model

// =======================
// configuration =========
// =======================
var port = process.env.PORT || 8080; // used to create, sign, and verify tokens
mongoose.connect(config.database); // connect to database
app.set('secret', config.secret);

// use body parser so we can get info from POST and/or URL parameters
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// use morgan to log requests to the console
app.use(morgan('dev'));

// =======================
// routes ================
// =======================
// basic route

app.get('/', function (req, res) {
    res.send('Hello! The API is at http://localhost:' + port + '/api');
});

// API ROUTES -------------------
// we'll get to these in a second

// =======================
// start the server ======
// =======================
app.get('/setup', function (req, res) {

    // create a sample user
    var nick = new User({
        name: 'father1frost',
        password: 'password',
        admin: true
    });


    // save the sample user
    nick.save(function (err) {
        if (err) throw err;

        console.log('User saved successfully');
        res.json({success: true});
    });
});
var apiRoutes = express.Router();

apiRoutes.post('/create', function (req, res) {
    console.log('req.body', req.body);
    if (req.body.name && req.body.password && (req.body.passwordConf === req.body.password)) {
        var userData = new User({
            name: req.body.name,
            password: req.body.password,
            admin: req.body.admin ? req.body.admin : false
        });


        //use schema.create to insert data into the db
        userData.save(function (err, user) {
            console.log(user);
            if (err) {
                console.error(err);
            }

            console.log('User created', user);
            res.json({success: true, message: 'User created.'});

        });
        //console.log('User created');
        //res.json({ success: true, message: 'User created.' });
    } else {
        if (req.body.passwordConf !== req.body.password)
            res.json({success: false, message: 'Passwords do not equal each other'});
    }

});

apiRoutes.post('/authenticate', function (req, res) {

    // find the user
    User.findOne({
        name: req.body.name
    }, function (err, user) {

        if (err) throw err;

        if (!user) {
            res.json({success: false, message: 'Authentication failed. User not found.'});
        } else if (user) {

            // check if password matches
            if (user.password != req.body.password) {
                res.json({success: false, message: 'Authentication failed. Wrong password.'});
            } else {

                // if user is found and password is right
                // create a token with only our given payload
                // we don't want to pass in the entire user since that has the password
                const payload = {
                    id: user._id,
                };
                var token = jwt.sign(payload, req.app.get('secret'), {
                    expiresIn: "5h"
                });

                // return the information including token as JSON
                res.json({
                    success: true,
                    message: 'Enjoy your token!',
                    token: token
                });
            }

        }

    });
});


// TODO: route to authenticate a user (POST http://localhost:8080/api/authenticate)

// TODO: route middleware to verify a token

// route to show a random message (GET http://localhost:8080/api/)
apiRoutes.get('/', function (req, res) {
    res.json({message: 'Welcome to the coolest API on earth!'});
});

// route to return all users (GET http://localhost:8080/api/users)
apiRoutes.post('/user', function (req, res, next)
 {
  jwt.verify(req.headers.token, config.secret, function (err, decoded){
    if (err){
        console.log(err);
        next();
    } else {
        User.findById(decoded.id, function(error, user) {
          res.json({success: true,  message: user});
          next();
         })
    }
  });

 })



// apply the routes to our application with the prefix /api
app.use('/api', apiRoutes);

// API ROUTES -------------------
// we'll get to these in a second

// =======================
// start the server ======
// =======================
app.listen(port);
console.log('Magic happens at http://localhost:' + port);