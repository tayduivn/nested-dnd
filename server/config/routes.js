const router = require("express").Router();

const { MW } = require("../app/util");
const auth = require("../app/user/auth");
const builtpacks = require("../app/builtpack/routes");
const characters = require("../app/character/routes");
const explore = require("../app/explore/routes");
const packs = require("../app/pack/routes");
const playersPreview = require("../app/explore/players-preview");
const tables = require("../app/table/routes");
const universes = require("../app/universe/routes");
const spotify = require("../app/spotify/routes");

// load our routes and pass in our app and fully configured passport
router.use("/auth", auth);
router.use("/builtpacks", builtpacks);
router.use("/characters", characters);
router.use("/explore", explore);
router.use("/packs", packs);
router.use("/players-preview", playersPreview);
router.use("/tables", tables);
router.use("/universes", MW.isLoggedIn, universes);
router.use("/spotify", spotify);

module.exports = router;
