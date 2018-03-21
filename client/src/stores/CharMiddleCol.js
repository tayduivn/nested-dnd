import spellStore from "./spellStore";

class ProficiencyCategory {
	constructor({ list = [], notes = [], double_proficiency = [] }) {
		this.list = list;
		this.double_proficiency = double_proficiency;
		this.notes = typeof notes === "string" ? [notes] : notes;
	}
	addAll(arr, note) {
		if(!arr || !arr.forEach)
			return;
		
		arr.forEach(l => {
			if (l.includes("choice")) return;
			if (!this.list.includes(l)) {
				this.list.push(l);
			}
		});
		this.notes.push(note + ": " + arr.join(", "));
	}
}

export class Proficiencies {
	constructor({
		skills = {},
		saves = {},
		languages = {},
		armor = {},
		weapons = {},
		tools = {}
	}) {
		this.skills = new ProficiencyCategory(skills);
		this.saves = new ProficiencyCategory(saves);
		this.languages = new ProficiencyCategory(languages);
		this.armor = new ProficiencyCategory(armor);
		this.weapons = new ProficiencyCategory(weapons);
		this.tools = new ProficiencyCategory(tools);
	}
	add(
		{
			skills = [],
			saves = [],
			languages = [],
			armor = [],
			weapons = [],
			tools = []
		},
		note
	) {
		if (skills.length && skills[0].includes("Choose"))
			this.skills.addAll([], skills);
		else this.skills.addAll(skills, note);

		this.saves.addAll(saves, note);
		this.languages.addAll(languages, note);
		this.armor.addAll(armor, note);
		this.weapons.addAll(weapons, note);
		this.tools.addAll(tools, note);
	}
}

export class Feature {
	constructor({
		name = "",
		desc = "",
		description = "",
		className = false,
		notes = ""
	}) {
		this.name = name;
		this.desc = desc;
		this.description = description;
		this.className = className;
		this.notes = notes;
	}
	getUses(abilities, level) {
		var uses;
		switch (this.name) {
			case "Tides of Chaos":
			case "Fury of the Small":
			case "Relentless Endurance":
			case "Second Wind":
				return 1;
			case "Sorcery Points":
				return level;
			case "Bardic Inspiration":
				uses = abilities.Charisma.getMod();
				if (uses < 1) uses = 1;
				break;
			case "Wrath of the Storm":
				uses = abilities.Wisdom.getMod();
				if (uses < 1) uses = 1;
				break;
			case "Channel Belief":
				uses = 1;
				if (level >= 6) uses = 2;
				else if (level >= 18) uses = 3;
				break;
			case "Rage":
				uses = 2;
				if (level >= 3) uses = 3;
				if (level >= 6) uses = 4;
				if (level >= 12) uses = 5;
				if (level >= 17) uses = 6;
				break;
			case "Wild Shape":
				uses = 2;
				break;
			case "Action Surge":
				uses = (level >= 17) ? 2 : 1;
				break;
			default:
				uses = false;
		}

		// get uses from spell if available
		let s = spellStore.get(this.name);
		if (s && s.isFeature && s.uses) return s.uses;

		return uses;
	}
	getDesc(level, abilities) {
		let desc = this.desc
			.replace("(lvl/2)", level / 2)
			.replace("(^lvl/2)", Math.ceil(level / 2))
			.replace("(lvlx2)", level * 2)
			.replace("(lvl)", level)
			.replace("(INT)", abilities.Intelligence.getMod());
		switch (this.name) {
			case "Circle Forms":
				if (level >= 6)
					return (
						"Transform into CR " +
						Math.floor(level / 3) +
						" creature"
					);
				return desc;
			default:
				return desc;
		}
	}
}


export class AdvResist {
	constructor({ advantages = [], resistances = [], other = [] }) {
		this.advantages = advantages;
		this.resistances = resistances;
		this.other = other ? other.map(a => new Feature(a)) : [];
	}
}

export class Health {
	constructor(hp = false) {
		this.hp = hp;
	}
	getHitDice(classes) {
		var hitDice = [];
		classes.forEach(c => {
			hitDice.push({
				dice: c.classData.hitDice,
				level: c.level
			});
		});
		return hitDice;
	}
	getHP(classes, CON) {
		if (this.hp !== false) return this.hp;

		//level 1
		var maxHP = classes[0].classData.hitDice + CON.getModAtLevel(1);

		var lvl = 2;
		classes.forEach(c => {
			//add for each level
			for (var i = lvl === 2 ? 1 : 0; i < c.level; i++) {
				// constitution modifier plus average hit dice roll
				maxHP +=
					CON.getModAtLevel(lvl) +
					Math.ceil((c.classData.hitDice + 1) / 2);
				lvl++;
			}

			//hp exceptions
			if (c.subclasses["Sorcerous Origin"] === "Draconic Bloodline") {
				maxHP += c.level;
			}
		});

		return maxHP;
	}
}