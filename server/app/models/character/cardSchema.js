const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var schema = Schema(
	{
		name: String,
		subtitle: String,
		level: Number,
		category: {
			type: String,
			enum: ["spell", "item"],
			default: "item"
		},
		weaponCategory: {
			type: String,
			enum: ["Simple", "Martial", null],
			default: "Simple"
		},
		range: String,
		longRange: {
			type: Number,
			set: v => (v === this.range ? null : v),
			get: v => (v === this.range ? null : v)
		},
		icon: String,
		duration: String,
		concentration: Boolean,
		consumable: Boolean,
		components: {
			types: String,
			materials: String
		},
		shortDesc: String,
		description: [String],
		attackType: {
			type: String,
			enum: ["Melee", "Ranged", "Both"],
			get: function(v) {
				return v === "Melee" && this.range ? "Both" : v;
			}
		},
		castTime: {
			type: String,
			default: function() {
				if (
					this.properties &&
					this.properties.find(p => p.name === "Light") &&
					!this.properties.find(p => p.name === "Two-Handed")
				) {
					return "1 action, 1 bonus action";
				}
				return "1 action";
			}
		},
		damage: {
			diceString: String,
			damageType: String,
			twoHandDice: {
				type: String,
				get: function(v) {
					if (v) return v;
					var isVersatile =
						this.properties &&
						this.properties.find(p => p.name === "Versatile");
					if (!isVersatile || !this.damage.diceString) return undefined;
					var diceParts = this.damage.diceString
						.split("d")
						.map(n => parseInt(n, 10));
					return diceParts[0] + "d" + (diceParts[1] + 2);
				}
			},
			progression: String,
			addModifier: Boolean
		},
		healing: {
			diceString: String,
			addModifier: Boolean
		},
		properties: [
			{
				name: String,
				description: String
			}
		],
		weight: Number,
		charges: Number,
		saveData: {
			dc: Number,
			throw: String,
			success: String,
			addModifier: Boolean
		},
		isFeature: Boolean,
		uses: {
			count: Number,
			reset: String
		}
	},
	{ toJSON: { getters: true, virtuals: true } }
);

schema.methods.setIcon = async function(builtpack) {
	const Generator = this.parent().db.models.Generator;

	if (this.icon) return this.icon;

	var generator = builtpack.getGen(this.name);
	if (!generator) generator = builtpack.getGen(this.name.toLowerCase());

	if (!generator) return;

	generator = new Generator(generator);

	if (generator.style) this.icon = await generator.style.makeIcon();

	return this.icon;
};

module.exports = schema;
