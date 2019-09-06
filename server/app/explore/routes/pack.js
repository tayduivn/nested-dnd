const router = require("express").Router();
const makeBuiltpack = require("builtpack/makeBuiltpack");

const MW = require("../../util/middleware");
// const Universe = require("../../universe/Universe");
// const { stringify, normalUniverseResponse, setLastSaw } = require("../../util");
const { normalizePack } = require("../../pack/normalize");
const { normalizeInstance } = require("universe/normalize");
const explorePack = require("pack/query/explorePack");
const Maker = require("generator/util/make");

router.get("/:url/:isa?", MW.canViewPack, async (req, res, next) => {
	try {
		const pack_url = req.params.url;
		const { pack, packs, tables, generators, seeds } = await explorePack(pack_url, req.user._id);

		const builtpack = makeBuiltpack(pack, generators);
		const maker = new Maker({ builtpack, tables });
		const nested = maker.make(builtpack.getGen(seeds[0]), 1, undefined);

		res.json(normalizePack({ packs, tables, generators, ...pack }));
	} catch (e) {
		next(e);
	}
});

module.exports = router;
