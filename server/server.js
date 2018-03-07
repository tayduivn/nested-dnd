'use strict';

const express = require("express");

const app = express();
const port = process.env.PORT || 3001;
const path = require('path');

if (process.env.NODE_ENV === 'production') {
	const staticPath = path.join(__dirname, '/../client/build');
	app.use(express.static(staticPath));
	console.log("Serving static files at / from "+staticPath);
}

app.get("/api/hello", (req, res) => {
	res.send({ express: "Hello From Express" });
});

app.listen(port, () => console.log(`Listening on port ${port}`));