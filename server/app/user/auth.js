const passport = require("passport");
const router = require("express").Router();

const { SCOPE } = require("../util/spotify");

const { deleteUser } = require("./query");
const { normalizeUser, USER_NOT_FOUND, USER_NOT_LOGGED_IN } = require("./messages");
const { deleteUniversesByUser } = require("../universe/query");
const { deleteTablesByUser } = require("../table/query");
const { NOT_FOUND, SERVER_ERROR, UNAUTHORIZED } = require("../util/status");

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

router.get(
	"/auth/spotify",
	passport.authenticate("spotify", {
		scope: SCOPE
	})
);

router.get(
	"/auth/spotify/callback",
	passport.authenticate("spotify", { failureRedirect: "/login" }),
	function(req, res) {
		// Successful authentication, redirect home.
		res.redirect("/");
	}
);

router.get("/connect/spotify", passport.authorize("spotify", { failureRedirect: "/account" }));

router.get(
	"/connect/spotify/callback",
	passport.authorize("spotify", { failureRedirect: "/account" }),
	function(req, res) {
		res.redirect("/account");
	}
);

router.delete("/account", async (req, res, next) => {
	if (!req.isAuthenticated()) {
		return res.status(NOT_FOUND).json({
			errors: [
				{
					title: USER_NOT_LOGGED_IN
				}
			]
		});
	}

	// get user and delete
	let user, universeResult, tableResult;
	try {
		user = await deleteUser(req.user._id);
		universeResult = await deleteUniversesByUser(req.user._id);
		tableResult = await deleteTablesByUser(req.user._id);
		// TODO: Delete packs, generators in those packs
	} catch (e) {
		next(e);
	}

	if (!user) {
		return res.status(NOT_FOUND).json({
			errors: [
				{
					title: USER_NOT_FOUND
				}
			]
		});
	}

	const deletedObjects = [
		normalizeUser(user),
		{ universes: universeResult.deletedCount },
		{ tables: tableResult.deletedCount }
	];

	// logout and return deleted objects
	logout(req, res, function(err) {
		if (err) {
			next(err);
		}

		res.json({
			meta: {
				deleted: deletedObjects
			}
		});
	});
});

// =====================================
// LOGOUT ==============================
// =====================================
router.post("/logout", function(req, res, next) {
	logout(req, res, err => {
		if (err) next(err);

		res.json({
			meta: { loggedIn: false }
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
			callback();
		} else callback(err);
	});
}

function login(err, user, info, req, res, next) {
	if (err) {
		return res.status(SERVER_ERROR).json(err);
	}
	if (!user) {
		return res.status(UNAUTHORIZED).send(info);
	}
	req.logIn(user, function(err) {
		if (err) {
			return res.headersSent ? next(err) : res.status(401).json(err);
		}

		res.header("Access-Control-Allow-Origin", "http://localhost:3000");
		res.header("Access-Control-Allow-Credentials", "true");

		if (user.local) user.local.password = undefined; //don't return the password
		res.cookie("loggedin", true);
		return res.json({
			data: {
				type: "User",
				id: user._id,
				attributes: { ...user, _id: undefined, __v: undefined }
			},
			meta: {
				loggedIn: true
			}
		});
	});
}

module.exports = router;
