const passport = require("passport");
const router = require("express").Router();

const User = require("../models/user");
const md = require("./middleware.js");

router.post("/login", function(req, res, next) {
	passport.authenticate("local", function(err, user, info) {
		login(err, user, info, req, res, next);
	})(req, res, next);
});

router.post("/signup", function(req, res, next) {
	passport.authenticate("local-signup", function(err, user, info) {
		login(err, user, info, req, res, next);
	})(req, res, next);
});

router.delete("/account", md.isLoggedIn, function(req, res, next) {
	// TODO: Delete all their stuff

	User.findById(req.user._id)
		.then(async user => {
			if (!user)
				return res.status(404).json({
					errorMessage: "Could not find logged in user",
					error: err
				});

			var deletedObjects = await user.remove();
			logout(req, res, function() {
				res.json(deletedObjects);
			});
		})
		.catch(next);
});

// =====================================
// LOGOUT ==============================
// =====================================
router.post("/logout", function(req, res) {
	logout(req, res, err => {
		if (err) return res.status(500).json(err);

		res.json({
			loggedIn: false
		});
	});
});

router.get("/user", function(req, res) {
	if (req.user) {
		res.json(req.user);
	} else {
		res.status(401).send();
	}
});

router.get("/loggedIn", function(req, res) {
	return res.json({ loggedIn: !!req.user });
});

function logout(req, res, callback) {
	req.logout();
	req.session.destroy(function(err) {
		if (!err) {
			res.clearCookie("connect.sid", {
				path: "/",
				httpOnly: true,
				secure: false,
				maxAge: null
			});
			callback(null);
		} else callback(err);
	});
}

function login(err, user, info, req, res, next) {
	if (err) {
		return res.status(401).json(err);
	}
	if (!user) {
		return res.status(401).send(info);
	}
	req.logIn(user, function(err) {
		if (err) {
			return res.headersSent ? next(err) : res.status(401).json(err);
		}

		res.header("Access-Control-Allow-Origin", "http://localhost:3000");
		res.header("Access-Control-Allow-Credentials", "true");

		if (user.local) user.local.password = undefined; //don't return the password
		return res.json({ loggedIn: true, user: user });
	});
}

module.exports = router;
