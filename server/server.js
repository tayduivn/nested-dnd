'use strict';

const express = require("express");

const app = express();
const port = process.env.PORT || 3001;
const path = require('path');

process.env.PWD = process.cwd();

if (process.env.NODE_ENV === 'production') {
	const staticPath = express.static(path.join(process.env.PWD, '/../client/build');
	app.use('/', staticPath);
	console.log("Serving static files at / from "+staticPath);
}

app.get("/api/hello", (req, res) => {
	res.send({ express: "Hello From Express" });
});

app.listen(port, () => console.log(`Listening on port ${port}`));