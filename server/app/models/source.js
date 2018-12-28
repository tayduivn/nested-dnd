const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var schema = Schema(
	{
		url: String,
		title: String,
		author: String,
		authorUrl: String
	},
	{ toJSON: { virtuals: true } }
);

schema.virtual("isDDB").get(function() {
	return this.url && this.url.includes("dndbeyond.com");
});

module.exports = schema;
