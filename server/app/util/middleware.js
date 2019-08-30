const mongoose = require("mongoose");
const debug = require("debug")("app:util");

const Pack = require("../pack/Pack");
const Universe = require("../universe/Universe");
const Table = require("../table/Table");
const Character = require("../character/Character");

const { getUser } = require("../user/query");
const { USER_NOT_LOGGED_IN, USER_FORBIDDEN } = require("../user/messages");
const { UNAUTHORIZED, FORBIDDEN, NOT_FOUND, SERVER_ERROR } = require("../util/status");
const toJSON = require("./toJSON");

const MW = {
	isLoggedIn: function(req, res, next) {
		// do any checks you want to in here

		// CHECK THE USER STORED IN SESSION FOR A CUSTOM VARIABLE
		// you can do this however you want with whatever variables you set up
		if (req.isAuthenticated()) {
			next();
			return true;
		}

		// IF A USER ISN'T LOGGED IN, THEN REDIRECT THEM SOMEWHERE
		res.status(UNAUTHORIZED).json({ errors: [{ title: USER_NOT_LOGGED_IN }] });
		return false;
	},

	isAdmin: function(req, res, next) {
		if (!MW.isLoggedIn(req, res, next)) return false;

		if (req.user.role === "administrator") {
			return next();
		}

		res.status(FORBIDDEN).json({ errors: [{ title: USER_FORBIDDEN }] });
	},

	canViewTable: async function(req, res, next) {
		debug("STARTING  Table.findById --- MW.canViewTable");
		let table;
		try {
			table = await Table.findById(req.params.table).exec();
		} catch (e) {
			next(e);
			return;
		}
		debug("    DONE  Table.findById --- MW.canViewTable");

		if (!table) return res.status(404);

		if (!table.public && (!req.user || table.user.toString() !== req.user.id))
			return res.status(FORBIDDEN).json({ errors: [{ title: USER_FORBIDDEN }] });

		// eslint-disable-next-line require-atomic-updates
		req.table = table;
		next();
		return table;
	},

	canEditTable: function(req, res, next) {
		if (!MW.isLoggedIn(req, res, () => {})) {
			return false;
		}
		debug("STARTING  Table.findById --- MW.canEditTable");
		return Table.findById(req.params.table)
			.exec()
			.then(table => {
				debug("    DONE  Table.findById --- MW.canEditTable");
				if (!table) return res.status(NOT_FOUND);

				if (!req.user || table.user.toString() !== req.user.id)
					return res.status(FORBIDDEN).json({ errors: [{ title: USER_FORBIDDEN }] });

				req.table = table;
				next();
			})
			.catch(next);
	},

	canViewPack: function(req, res, next) {
		return getPack(req, res, () => {
			if (!req.pack) return;

			// TODO: security hole?
			if (
				req.pack.public ||
				req.pack.universe_id ||
				(req.user && req.pack._user.id === req.user.id)
			) {
				return next();
			} else {
				return res.status(FORBIDDEN).json({ errors: [{ title: USER_FORBIDDEN }] });
			}
		});
	},

	ownsUniverse: async function(req, res, next) {
		if (!MW.isLoggedIn(req, res, () => {})) {
			return false;
		}
		await Universe.findById(req.params.universe)
			.populate("pack")
			.then(async universe => {
				if (!universe) return res.status(NOT_FOUND).send();
				if (!req.user || universe.user.toString() !== req.user.id) {
					return res.status(FORBIDDEN).json({ errors: [{ title: USER_FORBIDDEN }] });
				}
				req.universe = universe;
				req.universe.pack = universe.pack;
				next();
			})
			.catch(next);
	},

	ownsCharacter: function(req, res, next) {
		if (!MW.isLoggedIn(req, res, next)) return false;

		Character.findById(req.params.character)
			.populate("universe", "_id pack")
			.then(async char => {
				if (!char) return res.status(404).send();
				if (!req.user || char.user.toString() !== req.user.id) {
					return res.status(FORBIDDEN).json({ errors: [{ title: USER_FORBIDDEN }] });
				}
				req.character = char;
				next();
			})
			.catch(next);
	},

	canEditPack: function(req, res, next) {
		if (!MW.isLoggedIn(req, res, next)) return false;

		if (!req.isAuthenticated())
			res.status(401).json({ error: "You need to be logged in to edit packs." });

		return getPack(req, res, () => {
			if (!req.pack) return;

			// TODO: security issue?
			if (req.pack.universe_id || (req.user && req.pack._user.id === req.user.id)) {
				return next();
			} else {
				return res.status(401).json({ error: "You do not have permission to edit this pack" });
			}
		});
	},

	errorHandler: function(err, req, res, next) {
		// headers already sent, continue
		if (res.headersSent) {
			return next(err);
		}

		if (err.status)
			// user error
			res.status(err.status);
		else {
			res.status(SERVER_ERROR);
			console.error(err); // internal error
			console.error(err.fileName + " | col:" + err.columnNumber + " | line:" + err.lineNumber); // internal error
			console.error(err.stack);
		}

		var errJSON = toJSON(err);

		if (errJSON.errmsg) {
			errJSON.message = err.errmsg;
			delete errJSON.errmsg;
		}

		return res.json({
			errors: [
				{
					title: err.message,
					source: err.stack,
					meta: err.data
				}
			]
		});
	},

	getLoggedInUser: async function(req, res, next) {
		let loggedin = false;

		function get(cb) {
			if (req.sessionID) {
				debug("req.sessionStore.get");
				req.sessionStore.get(req.sessionID, async function(err, mySession) {
					if (mySession && mySession.passport && mySession.passport.user) {
						try {
							const user = await getUser(mySession.passport.user);
							if (user) loggedin = true;
							cb();
						} catch (e) {
							cb(e);
						}
					} else {
						cb();
					}
				});
			} else {
				cb();
			}
		}

		// no logged in user
		get(e => {
			res.cookie("loggedin", loggedin);
			next(e);
		});
	}
};

/**
 * Puts the pack in the req object
 */

async function getPack(req, res, next) {
	const url = req.params.url || req.params.pack;

	if (!url) return res.status(412).json({ error: "Missing pack id" });

	let query;

	try {
		const _id = mongoose.Types.ObjectId(url);
		query = Pack.findOne().or([{ url }, { _id }]);
	} catch (e) {
		query = Pack.findOne({ url });
	}

	debug("STARTING  Pack.findOne --- Mw getPack");
	const pack = await query.populate("_user", "name id").exec();

	if (!pack) {
		var error = {
			error: "Couldn't find pack? " + req.params.pack + req.params.url
		};
		if (!res.headersSent) {
			res.status(404).json(error);
		}
		return next(error);
	}
	debug("    DONE  Pack.findOne --- Mw getPack");

	req.pack = pack;

	if (next) {
		next();
	}

	return;
}

module.exports = MW;
