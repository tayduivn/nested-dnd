const router = require("express").Router();
const universes = require("./universes");
const explore = require("./explore");

const MW = require("../middleware");

router.use("/universes", MW.isLoggedIn, universes);
router.use("/explore", explore);

module.exports = router;
