const router = require("express").Router();

const Pack = require("../../models/pack");

const pack = require("./pack");

function normalizePackArray(byId, array) {
	return array.map(pack => {
		byId[pack._id] = pack;
		return pack._id;
	});
}

// Get All Packs
// ---------------------------------
router.get("/", (req, res, next) => {
	var publicPackSettings = {
		public: true
	};
	//if logged in, don't get pack I own
	if (req.user) {
		publicPackSettings._user = { $ne: req.user._id };
	}

	//get public packs
	Pack.find(publicPackSettings)
		.exec()
		.then(publicPacks => {
			const byId = {};
			publicPacks = normalizePackArray(byId, publicPacks);

			if (!req.user) {
				return res.json({ byId, publicPacks });
			}

			// find packs I own
			Pack.find({ _user: req.user._id })
				.exec()
				.then(myPacks => {
					myPacks = normalizePackArray(byId, myPacks);
					return res.json({ byId, myPacks, publicPacks });
				})
				.catch(next);
		})
		.catch(next);
});

// Create Pack
// ---------------------------------

//TODO: Check public packs have unique names
router.post("/", (req, res, next) => {
	var newPack = req.body;
	newPack._user = req.user._id;
	delete newPack.seed; //can't set, don't have any generators yet

	Pack.create(newPack)
		.then(newPack => {
			return res.json(newPack);
		})
		.catch(next);
});

router.use("/:url", pack);

module.exports = router;
