const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const ObjectId = mongoose.mongo.ObjectId;

const Table = require("../../table/Table");
const Generator = require("../Generator");

var mixedTypeSchema = Schema(
	{
		type: {
			$type: String,
			enum: ["table_id", "string", "table", "data"], // if no type, it's a string
			default: "string"
		},
		value: Schema.Types.Mixed
	},
	{ typeKey: "$type" }
);

// extends the mixedTypeSchema to add an icon type
const iconSchema = Schema(
	{
		category: {
			$type: String,
			enum: ["icon", "img", "char", "video"],
			default: "icon"
		},
		type: {
			$type: String,
			enum: ["table_id", "string", "table", "data"], // if no type, it's a string
			default: "string"
		},
		doHue: Boolean,
		value: Schema.Types.Mixed
	},
	{ typeKey: "$type", _id: false }
);

var styleSchema = Schema(
	{
		icon: {
			type: iconSchema,
			set: validateMixedThing
		},

		// deprecated
		useImg: Boolean,

		// todo: check hex or valid color name
		txt: {
			type: mixedTypeSchema,
			set: validateMixedThing
		},

		// todo: check hex or valid color name
		bg: {
			type: mixedTypeSchema,
			set: validateMixedThing
		},

		pattern: {
			type: mixedTypeSchema,
			set: validateMixedThing
		},

		// if the generated name will affect the color
		// TODO: use to generate background color
		noAutoColor: Boolean
	},
	{ _id: false }
);

styleSchema.path("icon").set(validateMixedThing);

// this is a setter, not a validator
// eslint-disable-next-line complexity, max-statements
function validateMixedThing(input) {
	if (typeof input === "string") {
		return { type: "string", value: input };
	}

	if (input === null) {
		return undefined;
	}
	// it must be an object
	if (typeof input !== "object") {
		throw Error("cannot set name to value " + input);
	}

	let { type, value } = input;

	if (value === null) {
		value = undefined;
		return { type, value };
	}
	switch (type) {
		case "embed": // embedded generator
			if (typeof value === "object") {
				value = new Generator(value);
				return { type: "embed", value: value.toJSON() };
			}
			break;

		case "data":
			// TODO
			return { type: "data", value };

		case "generator":
			if (typeof value === "string") return { type: "generator", value: value };
			break;

		case "table":
			if (typeof value === "string") {
				return { type: "string", value: value };
			} else if (value.rows && value.rows.length === 1 && typeof value.rows[0] === "string") {
				return { type: "string", value: value.rows[0] };
			}
			// validate against table schema
			var t = new Table(value);
			value = t.toJSON();
			delete value._id;
			delete value.pack;
			delete value.public;
			return { type: "table", value };

		case "table_id":
			// cast strings to ObjectId
			if (typeof value === "string") {
				value = ObjectId(value);
			}
			if (value instanceof ObjectId) return { type: "table_id", value };
			else break;

		case "string":
		default:
			if (typeof value === "string") return { type: "string", value: value };
	}
	throw Error("cannot set mixed thing to value " + input);
}

module.exports = styleSchema;
module.exports.validateMixedThing = validateMixedThing;
module.exports.mixedTypeSchema = mixedTypeSchema;
