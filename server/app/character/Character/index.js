const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const cardSchema = require("./cardSchema");

const SKILL_NAMES = [
	"Acrobatics",
	"Animal Handling",
	"Arcana",
	"Athletics",
	"Deception",
	"History",
	"Insight",
	"Intimidation",
	"Investigation",
	"Medicine",
	"Nature",
	"Perception",
	"Performance",
	"Persuasion",
	"Religion",
	"Sleight of Hand",
	"Stealth",
	"Survival"
];

function appendPlus(val) {
	if (val > 0) {
		return "+" + val;
	}
	return "" + val;
}

function getMod(val) {
	var mod = Math.floor((val - 10) / 2);
	if (val >= 30) mod = 10;
	else if (val < 2) mod = -5;
	return mod;
}

var abilitySchema = Schema(
	{
		base: {
			type: Number,
			default: 10,
			required: true,
			min: 0,
			max: 20
		},
		saveProficient: Boolean,
		adjust: [
			{
				value: Number,
				level: Number
			}
		]
	},
	{ toJSON: { virtuals: true } }
);

abilitySchema.virtual("score").get(function() {
	var score = this.base;
	this.adjust.forEach(a => (score += a.value));
	return score;
});

abilitySchema.virtual("mod").get(function() {
	return getMod(this.score);
});

abilitySchema.virtual("printMod").get(function() {
	return appendPlus(this.mod);
});

abilitySchema.virtual("saveMod").get(function() {
	return this.saveProficient ? this.mod + this.parent().proficiencyBonus : this.mod;
});

abilitySchema.virtual("printSave").get(function() {
	return appendPlus(this.saveMod);
});

var equipmentSchema = Schema(
	{
		hasShield: Boolean,
		armor: {
			name: String,
			data: {
				itemType: String,
				ac: Number
			},
			unarmoredBonus: Number
		},
		containers: [
			{
				name: String,
				content: [String]
			}
		],
		items: [String],
		weapons: String
	},
	{ toJSON: { virtuals: true } }
);

equipmentSchema.virtual("ac").get(function() {
	if (!this.armor || !this.armor.data || !this.armor.data.ac) return this.unarmoredAC;

	const DEX = this.parent().abilities.dex.mod;
	var ac = this.armor.data.ac || 0;

	if (this.armor.data.itemType === "Light Armor") {
		ac += DEX;
	} else if (this.armor.itemType === "Medium Armor") {
		if (DEX === 1) ac += 1;
		else ac += 2;
	}

	if (this.hasShield) {
		ac += 2;
	}

	return ac;
});

equipmentSchema.virtual("unarmoredAC").get(function() {
	const character = this.parent();

	var DEX = character.abilities.dex.mod;
	var CON = character.abilities.con.mod;
	var WIS = character.abilities.wis.mod;

	/* TODO
		if (character.isClass("Barbarian")) return 10 + DEX + CON;
		if (character.isClass("Monk")) return 10 + DEX + WIS;
	*/

	return 10 + DEX + (this.armor.unarmoredBonus ? this.armor.unarmoredBonus : 0);
});

equipmentSchema.virtual("unshieldedAC").get(function() {
	if (this.hasShield) return this.ac - 2;
	else return this.ac;
});

var featureSchema = Schema(
	{
		desc: String,
		name: String,
		uses: Number
	},
	{ toJSON: { virtuals: true } }
);

var spellSchema = Schema({
	name: String,
	level: Number,
	ritual: Boolean,
	prepared: Boolean,
	note: String
});

var spellcastingClassSchema = Schema(
	{
		name: String,
		title: String,
		ritualCast: Boolean,
		level: Number,
		ability: {
			type: String,
			enum: ["str", "con", "dex", "wis", "int", "cha"]
		},
		spells: [[spellSchema]]
	},
	{ toJSON: { virtuals: true } }
);

spellcastingClassSchema.virtual("dc").get(function() {
	var char = this.parent().parent();
	if (!char || !char.abilities || !char.abilities[this.ability]) return 0;
	return 8 + char.abilities[this.ability].mod + char.proficiencyBonus;
});

spellcastingClassSchema.virtual("printAbility").get(function() {
	return this.ability.toUpperCase();
});

spellcastingClassSchema.virtual("prepares").get(function() {
	return this.name !== "Sorcerer";
});

spellcastingClassSchema.virtual("numPrepared").get(function() {
	var char = this.parent().parent();
	return this.level + char.abilities[this.ability].mod;
});

spellcastingClassSchema.virtual("totalSpells").get(function() {
	return this.spells.lengt;
});

var spellcastingSchema = Schema({
	list: {
		type: [spellcastingClassSchema],
		default: void 0
	},
	slots: {
		type: [Number],
		default: void 0
	}
});

spellcastingSchema.virtual("totalSpells").get(function() {
	var totalSpells = 0;
	this.list.forEach(cl => {
		totalSpells += cl.spells.length;
	});
	return totalSpells;
});

var schema = Schema(
	{
		user: {
			type: Schema.Types.ObjectId,
			ref: "User"
		},
		universe: {
			type: Schema.Types.ObjectId,
			ref: "Universe"
		},

		name: String,
		player: String,
		hp: Number,
		hitDice: [
			{
				value: Number,
				count: Number
			}
		],
		ddbURL: String,

		proficiencyBonus: {
			type: Number,
			default: 2
		},
		level: {
			type: Number,
			default: 1
		},

		classes: [
			{
				name: String,
				level: Number,
				subclasses: Object
			}
		],
		race: {
			name: String,
			label: String,
			size: String
		},
		abilities: {
			cha: {
				type: abilitySchema,
				default: { base: 10 }
			},
			con: {
				type: abilitySchema,
				default: { base: 10 }
			},
			dex: {
				type: abilitySchema,
				default: { base: 10 }
			},
			int: {
				type: abilitySchema,
				default: { base: 10 }
			},
			str: {
				type: abilitySchema,
				default: { base: 10 }
			},
			wis: {
				type: abilitySchema,
				default: { base: 10 }
			}
		},
		advResist: {
			advantages: [String],
			resistances: [String],
			other: [featureSchema]
		},
		features: [featureSchema],
		background: {
			alignment: {
				type: String,
				enum: [
					"Lawful Good",
					"Lawful Neutral",
					"Lawful Evil",
					"Neutral Good",
					"True Neutral",
					"Neutral Evil",
					"Chaotic Good",
					"Chaotic Neutral",
					"Chaotic Evil",
					"Unknown"
				]
			},
			bond: String,
			flaw: String,
			ideal: String,
			name: String,
			personality: String,
			specialty: String,
			startingCoin: String
		},
		body: {
			eyes: String,
			hair: String,
			height: String,
			skin: String,
			weight: Number,
			age: Number,
			gender: String,
			speeds: {
				walk: Number,
				fly: Number,
				burrow: Number,
				swim: Number,
				climb: Number
			}
		},
		equipment: equipmentSchema,
		proficiencies: {
			armor: [String],
			languages: [String],
			skills: [String],
			doubleSkills: [String],
			tools: [String],
			doubleTools: [String],
			weapons: [String]
		},
		spellcasting: {
			type: spellcastingSchema,
			default: null
		},
		cards: [cardSchema]
	},
	{ toJSON: { virtuals: true } }
);

schema.virtual("initiative").get(function() {
	return this.abilities.dex.printMod;
});

schema.virtual("skills").get(function() {
	var skills = (this.proficiencies && this.proficiencies.skills) || [];
	var doubleSkills = (this.proficiencies && this.proficiencies.doubleSkills) || [];
	const _this = this;

	return SKILL_NAMES.map(function(name) {
		var data = {
			name: name,
			proficient: skills.includes(name),
			double: doubleSkills.includes(name)
		};
		data.printMod = getSkillMod.call(_this, data);
		return data;
	});
});

schema.virtual("printProficiencyBonus").get(function() {
	return appendPlus(this.proficiencyBonus);
});

function getSkillMod({ name, proficient, double }) {
	var mod = 0;

	switch (name) {
		case "Athletics":
			mod = this.abilities.str.mod;
			break;
		case "Acrobatics":
		case "Sleight of Hand":
		case "Stealth":
			mod = this.abilities.dex.mod;
			break;
		case "Arcana":
		case "History":
		case "Investigation":
		case "Nature":
		case "Religion":
			mod = this.abilities.int.mod;
			break;
		case "Animal Handling":
		case "Insight":
		case "Medicine":
		case "Perception":
		case "Survival":
			mod = this.abilities.wis.mod;
			break;
		default:
			mod = this.abilities.cha.mod;
	}

	if (proficient) {
		let profBonus = this.proficiencyBonus;
		mod += profBonus;

		if (double) mod += profBonus;
	}

	return appendPlus(mod);
}

module.exports = mongoose.model("Character", schema);
