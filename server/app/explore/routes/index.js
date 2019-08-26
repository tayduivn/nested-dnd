const router = require("express").Router();

router.use("/pack", require("./pack"));

router.use("/universe", require("./universe"));

module.exports = router;
