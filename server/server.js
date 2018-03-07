'use strict';

const express = require("express");

const app = express();
const port = 3001;

if (process.env.NODE_ENV === 'production') {
	app.use('/', express.static(`${__dirname}/../client/build`));
}

app.get("/api/hello", (req, res) => {
	res.send({ express: "Hello From Express" });
});

app.listen(port, () => console.log(`Listening on port ${port}`));