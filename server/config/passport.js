"use strict";
const { getExpiration } = require("../app/util/spotify");

// load all the things we need
var LocalStrategy = require("passport-local").Strategy;
const SpotifyStrategy = require("passport-spotify").Strategy;

// load up the user model
var User = require("../app/user/User");

const PASSWORD_MIN_LENGTH = 8;
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;

// eslint-disable-next-line max-lines-per-function
function spotify(passport) {
	passport.use(
		new SpotifyStrategy(
			{
				clientID: process.env.SPOTIFY_CLIENT_ID,
				clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
				callbackURL: "/api/auth/spotify/callback",
				passReqToCallback: true
			},
			async function(req, accessToken, refreshToken, expires_in, profile, done) {
				let user;
				const doc = {
					accessToken,
					refreshToken,
					id: profile.id,
					expires: getExpiration(expires_in)
				};

				if (!req.user) {
					// not logged-in
					user = await User.findOneAndUpdate(
						{ $or: [{ "spotify.id": profile.id }, { "local.email": profile._json.email }] },
						{
							spotify: doc
						},
						{ upsert: true, new: true }
					).exec();

					// the user still couldn't be created
					if (!user) {
						done(new Error("could not create user"));
					}
					console.log(user);
					done(null, user);
				} else {
					req.user.spotify = doc;
					await req.user.save();
					done(null, req.user);
				}
			}
		)
	);
}

// eslint-disable-next-line max-lines-per-function
function local(passport) {
	// =========================================================================
	// LOCAL SIGNUP ============================================================
	// =========================================================================
	// we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

	passport.use(
		"local-signup",
		new LocalStrategy(
			{
				// by default, local strategy uses username and password, we will override with email
				usernameField: "email",
				passwordField: "password",
				passReqToCallback: true // allows us to pass back the entire request to the callback
			},
			function(req, email, password, done) {
				// asynchronous
				// User.findOne wont fire unless data is sent back
				process.nextTick(function() {
					let errorMessages = {};

					// validate password min length
					if (password.length < PASSWORD_MIN_LENGTH) {
						errorMessages.passwordError = "Password must be at least 8 characters long.";
					}

					// validate email format
					if (!email.match(EMAIL_REGEX)) {
						errorMessages.emailError = "Please enter a valid email address.";
						return done(null, false, errorMessages);
					} else {
						// find a user whose email is the same as the forms email
						// we are checking to see if the user trying to login already exists
						User.findOne({ "local.email": email }, function(err, user) {
							// if there are any errors, return the error
							if (err) return done(err);

							// check to see if theres already a user with that email
							if (user) {
								errorMessages.emailError = "That email is already taken.";
								return done(null, false, errorMessages);
							} else {
								// if there is no user with that email
								// create the user
								var newUser = new User();

								// set the user's local credentials
								newUser.name = email.substring(0, email.indexOf("@"));
								newUser.local.email = email;
								newUser.local.password = newUser.generateHash(password);

								// save the user
								newUser.save(function(err) {
									if (err) throw err;
									return done(null, newUser);
								});
							}
						});
					}
				});
			}
		)
	); //local-signup

	// =========================================================================
	// LOCAL LOGIN =============================================================
	// =========================================================================
	// we are using named strategies since we have one for login and one for signup
	// by default, if there was no name, it would just be called 'local'

	passport.use(
		"local",
		new LocalStrategy(
			{
				// by default, local strategy uses username and password, we will override with email
				usernameField: "email",
				passwordField: "password",
				passReqToCallback: true // allows us to pass back the entire request to the callback
			},
			function(req, email, password, done) {
				// callback with email and password from our form

				// find a user whose email is the same as the forms email
				// we are checking to see if the user trying to login already exists
				User.findOne({ "local.email": email }, function(err, user) {
					// if there are any errors, return the error before anything else
					if (err) return done(err);

					// if no user is found, return the message
					if (!user) return done(null, false, { emailError: "No user found." }); // req.flash is the way to set flashdata using connect-flash

					// if the user is found but the password is wrong
					if (!user.validPassword(password))
						return done(null, false, { passwordError: "Incorrect password." }); // create the loginMessage and save it to session as flashdata

					// all is well, return successful user
					return done(null, user);
				});
			}
		)
	); //"local-login"
}

// expose this function to our app using module.exports
// eslint-disable-next-line max-lines-per-function
module.exports = function(passport) {
	// =========================================================================
	// passport session setup ==================================================
	// =========================================================================
	// required for persistent login sessions
	// passport needs ability to serialize and unserialize users out of session

	// used to serialize the user for the session
	passport.serializeUser(function(user, done) {
		done(null, user.id);
	});

	// used to deserialize the user
	passport.deserializeUser(function(id, done) {
		User.findById(id, function(err, user) {
			done(err, user);
		});
	});

	local(passport);
	if (process.env.SPOTIFY_CLIENT_ID && process.env.SPOTIFY_CLIENT_SECRET) {
		spotify(passport);
	}
};
