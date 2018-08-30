const skillNames = [
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


class Save {
	constructor({ proficient = false, note = "" }) {
		this.proficient = !!proficient;
		this.note = note;
	}
}

class Ability {
	/**
	 * @param {value: Number, level: Number, notes: String} adjust 
	 */
	constructor({ base = 10, save = {}, adjust = [], notes = [] }) {
		this.base = base;
		this.save = new Save(save);
		this.adjust = [];
		this.profBonus = 0;
		this.notes = notes;

		if (adjust.forEach){
			adjust.forEach(a => this.addAdjustment(a.value, a.level, a.notes));
		}
	}
	addAdjustment(value, level, notes) {
		this.adjust.push({
			value: value,
			level: level,
			notes: notes
		});
	}
	getScore() {
		var score = this.base;
		this.adjust.forEach(a => (score += a.value));
		return score;
	}
	getModAtLevel(level) {
		var value = this.base;
		this.adjust.forEach(a => {
			if (level >= a.level) value += a.value;
		});
		return getMod(value);
	}
	getMod() {
		return getMod(this.getScore());
	}
	printMod() {
		return appendPlus(this.getMod());
	}
	printSave() {
		return appendPlus(this.getMod() + this.profBonus);
	}
}


export class Abilities {
	constructor({
		Strength = {},
		Dexterity = {},
		Constitution = {},
		Intelligence = {},
		Wisdom = {},
		Charisma = {}
	}) {
		this.Strength = new Ability(Strength);
		this.Dexterity = new Ability(Dexterity);
		this.Constitution = new Ability(Constitution);
		this.Intelligence = new Ability(Intelligence);
		this.Wisdom = new Ability(Wisdom);
		this.Charisma = new Ability(Charisma);
	}
	setSaveProficiencies(list = [], profBonus) {
		list.forEach(ability => {
			this[ability].save.proficient = true;
			this[ability].profBonus = profBonus;
		});
	}
}


class Skill {
	constructor(name, proficient = false, doubleProficient = false, character) {
		this.name = name;
		this.proficient = !!proficient;
		this.doubleProficient = !!doubleProficient;
		this.abilities = character.abilities;
		this.character = character;
	}
	getMod() {
		var mod = 0;

		switch (this.name) {
			case "Athletics":
				mod = this.abilities.Strength.getMod();
				break;
			case "Acrobatics":
			case "Sleight of Hand":
			case "Stealth":
				mod = this.abilities.Dexterity.getMod();
				break;
			case "Arcana":
			case "History":
			case "Investigation":
			case "Nature":
			case "Religion":
				mod = this.abilities.Intelligence.getMod();
				break;
			case "Animal Handling":
			case "Insight":
			case "Medicine":
			case "Perception":
			case "Survival":
				mod = this.abilities.Wisdom.getMod();
				break;
			default:
				mod = this.abilities.Charisma.getMod();
		}

		if (this.proficient) {
			let profBonus = this.character.proficiencyBonus;
			mod += profBonus;

			if(this.doubleProficient) mod += profBonus;
		}

		return appendPlus(mod);
	}
}

export class Skills {
	constructor(proficient = [], doubleProficient = [], character) {
		this.proficient = proficient;
		this.doubleProficient = doubleProficient;
		this.abilities = character.abilities;
		this.character = character;
	}
	getInitiative() {
		return appendPlus(this.abilities.Dexterity.getMod());
	}
	getList() {
		var _this = this;
		return skillNames.map(function(name) {
			return new Skill(
				name,
				_this.proficient.includes(name),
				_this.doubleProficient.includes(name),
				_this.character
			);
		});
	}
}