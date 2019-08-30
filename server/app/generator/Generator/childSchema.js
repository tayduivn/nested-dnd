const Schema = require("mongoose").Schema;

const { rand } = require("../../util");
const { validateMixedThing } = require("./styleSchema");

var childSchema = Schema(
	{
		type: {
			$type: String,
			require: true,
			enum: ["string", "generator", "table", "embed", "table_id", "data"], //if no type, string
			default: "string"
		},
		value: {
			$type: Schema.Types.Mixed
		},
		amount: {
			min: {
				$type: Number,
				min: 0
			},
			max: {
				$type: Number,
				min: 1
			} //max will be empty when it's always the samae
		},
		chance: {
			$type: Number,
			min: 0,
			max: 100
		},
		isEmbedded: Boolean
	},
	{ typeKey: "$type" }
);

function validateChildSchema({ type, value, amount, chance, isEmbedded }) {
	const out = validateMixedThing({ type, value });
	return { ...out, amount, chance, isEmbedded };
}

/**
 * @return {boolean} if the child will be included in the generated object based on % chance
 */
childSchema.virtual("isIncluded").get(function() {
	if (typeof this.chance !== "number" || this.chance >= 100) return true;
	return Math.random() * 100 <= this.chance;
});

/**
 * @return {Integer} how many copies of the child will be generated
 */
childSchema.virtual("makeAmount").get(function() {
	if (!this.amount || typeof this.amount.min !== "number") return 1;
	if (this.amount.max) {
		return rand(this.amount.min, this.amount.max);
	}
	return this.amount.min;
});

childSchema.validateChildSchema = validateChildSchema;
module.exports = childSchema;
