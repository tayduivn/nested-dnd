'use strict';

//get all the packages
const express = require("express");
const bodyParser= require('body-parser')
const cookieParser = require('cookie-parser')
const path = require('path');
const passport = require('passport');
const mongoose = require('mongoose');
const session = require('express-session');
const flash = require('connect-flash');
const morgan = require('morgan');
const config = require('./config.js');

const app = express();
const port = process.env.PORT || 5000;

let db;

// serve static files in production
if (process.env.NODE_ENV === 'production') {
	const staticPath = path.join(__dirname, '/../client/build');
	app.use(express.static(staticPath));
	console.log("Serving static files at / from "+staticPath);
}
else{
	//connect to dev database
	mongoose.connect('mongodb://localhost:27017/nested-dnd');
}

require('./config/passport')(passport); // pass passport for configuration

app.use(morgan('dev')); // log every request to the console
app.enable('trust proxy');

// set up parsers
app.use(bodyParser.urlencoded({extended: true})) // parse application/x-www-form-urlencoded
app.use(bodyParser.json()) // parse application/json
app.use(cookieParser()); // read cookies (needed for auth)

//auth
app.use(session({ 
	secret: config.sessionSecret, 
	proxy: true 
})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session


// routes ======================================================================

require('./app/routes.js')(app, passport);  // load our routes and pass in our app and fully configured passport




// launch ======================================================================

app.listen(port, () => console.log(`Listening on port ${port}`));

