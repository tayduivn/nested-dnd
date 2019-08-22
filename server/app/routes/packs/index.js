const router = require("express").Router();

const Pack = require("../../models/pack");

const pack = require("./pack");
const normalizePacks = require("../../util/normalizePacks");

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
		.then(async publicPacks => {
			let publicNormal = normalizePacks(publicPacks);

			if (!req.user) {
				const { byId, byUrl, idArray } = publicNormal;
				return res.json({ byId, byUrl, publicPacks: idArray });
			}

			// find packs I own
			Pack.find({ _user: req.user._id })
				.exec()
				.then(async myPacks => {
					let myNormal = normalizePacks(myPacks);
					return res.json({
						byId: { ...publicNormal.byId, ...myNormal.byId },
						byUrl: { ...publicNormal.byUrl, ...myNormal.byUrl },
						myPacks: myNormal.idArray,
						publicPacks: publicNormal.idArray
					});
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
