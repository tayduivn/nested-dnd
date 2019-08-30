const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const sourceSchema = require("../source/Source");

var rowSchema = Schema(
	{
		type: {
			$type: String,
			enum: ["string", "generator", "table", "embed", "table_id", "data", "dice"],
			default: "string"
		},
		value: Schema.Types.Mixed,
		weight: Number
	},
	{ typeKey: "$type", _id: false }
);

var tableSchema = Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: "User"
	},
	pack: {
		//pack that this table is contained within
		type: Schema.Types.ObjectId,
		ref: "Pack"
	},
	title: String,
	desc: String,
	returns: {
		type: String,
		enum: ["generator", "text", "fng"],
		default: "text"
	},
	rows: {
		type: [rowSchema],
		set: input =>
			input.map(row => {
				if (typeof row === "string") {
					return {
						type: this.returns === "generator" ? "generator" : "string",
						value: row
					};
				}
				return row;
			})
	},
	concat: Boolean,
	rowWeights: Boolean,
	tableWeight: Number,
	public: {
		type: Boolean,
		default: false
	},
	source: sourceSchema
});

/**
 * Cleans rows to be row schema if they are strings
 */
// TODO: migrate
tableSchema.path("rows").set(arr => {
	arr = arr.map(row => {
		if (typeof row === "string") {
			return { value: row };
		}
		return row;
	});
	return arr;
});

module.exports = mongoose.model("Table", tableSchema);
module.exports.rowSchema = rowSchema;
