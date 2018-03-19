import classStore, { raceStore, backgroundStore } from "./classStore";
import spellStore from "./spellStore";

import { Abilities, Skills } from "./CharacterAbilities";
import SpellcastingList from "./Spellcasting";

const proficiencyBonuses = [
	null,
	2,
	2,
	2,
	2,
	3,
	3,
	3,
	3,
	4,
	4,
	4,
	4,
	5,
	5,
	5,
	5,
	6,
	6,
	6,
	6
];

export default class Character {
	constructor(
		{
			lock = false,
			advResist = {},
			background = {},
			equipment = [],
			classes = [],
			features = [],
			name = "",
			player = "",
			proficiencies = {},
			race = { name: "Human" },
			abilities = {},
			hp = false,
			body
		} = {}
	) {
		if (hp !== false) hp = parseInt(hp, 10);

		this.lock = !!lock;
		this.name = name;
		this.player = player;
		this.race = { ...raceStore.get(race.name), race };
		this.classes = classes.map ? classes.map(c => new ClassInfo(c)) : [];
		this.background = new Background(background);
		this.abilities = new Abilities(abilities);
		this.health = new Health(hp);
		this.proficiencies = new Proficiencies(proficiencies);
		this.equipment = new Equipment(equipment, this);
		this.advResist = new AdvResist(advResist);
		this.features = features.map ? features.map(a => new Feature(a)) : [];
		this.body = new Body(body, this.race.speed);
		this.spellcasting = false;
		this.cards = new Cards(this.equipment.items, [], this.features);

		// adjust ability scores based on race
		for (var ability in this.race.abilities) {
			this.abilities[ability].addAdjustment(
				this.race.abilities[ability],
				1,
				this.race.name
			);
		}

		// adjust speed if Monk
		let monk = this.getClass("Monk");
		if(monk && monk.level >= 2 && !this.equipment.armor && !this.equipment.hasShield){
			this.body.speed += 10;
		}

		this.addProficiencies();
		this.addFeaturesAndAdvantages();
	}
	getSkills() {
		return new Skills(this.proficiencies.skills.list, this.proficiencies.skills.double_proficiency, this);
	}
	isClass(name) {
		for (var i = 0; i < this.classes.length; i++) {
			if (this.classes[i].name === name) return true;
		}
		return false;
	}
	/**
	 * @return ClassInfo
	 */
	getClass(name) {
		for (var i = 0; i < this.classes.length; i++) {
			if (this.classes[i].name === name) return this.classes[i];
		}
		return false;
	}
	isSubclass(name, value) {
		for (var i = 0; i < this.classes.length; i++) {
			if (this.classes[i].isSubclass(name, value)) return true;
		}
		return false;
	}
	addProficiencies() {
		this.proficiencies.add(this.race.proficiencies, this.race.name);
		if (this.background.proficiencies)
			this.proficiencies.add(
				this.background.proficiencies,
				this.background.name
			);
		this.classes.forEach(({ classData }) => {
			this.proficiencies.add(classData.proficiencies, classData.name);
		});

		this.abilities.setSaveProficiencies(
			this.proficiencies.saves.list,
			this.getProficiencyBonus()
		);
	}
	addFeaturesAndAdvantages() {
		// get features and advantages
		var newFeatures = [];
		var newAdvantages = [];

		// background feature
		if (this.background.feature) {
			newFeatures.push(new Feature(this.background.feature));
		} else if (this.background.name) {
			var bg = backgroundStore.get(this.background.name);
			if (bg.feature) newFeatures.push(bg.feature);
		}

		//race features
		if (this.race.advResist) {
			for (var adv in this.race.advResist.other) {
				newAdvantages.push({
					name: adv,
					desc: this.race.advResist.other[adv]
				});
			}
			if (this.race.advResist.advantages) {
				this.advResist.advantages.push(
					...this.race.advResist.advantages
				);
			}
			if (this.race.advResist.resistances) {
				this.advResist.resistances.push(
					...this.race.advResist.resistances
				);
			}
		}


		for (var feat in this.race.features) {
			newFeatures.push({ ...this.race.features[feat], name: feat });
		}

		//classes features
		this.classes.forEach(({ classData, level, subclasses }) => {
			newFeatures.push(
				...classData.getFeaturesAtLevel(level, subclasses)
			);
		});

		// process advantages
		newFeatures.forEach(f => {
			if (f.advantage) this.advResist.advantages.push(f.advantage);
			if (f.resist) this.advResist.resistances.push(f.resist);
			if (f.advResist) newAdvantages.push(f.advResist);
			if (f.proficiencies)
				this.proficiencies.add(f.proficiencies, f.name);
			this.features.push(new Feature(f));
		});
		newAdvantages.forEach(a => {
			this.advResist.other.push(new Feature(a));
		});
	}
	getSpellcasting() {
		let profBonus = this.getProficiencyBonus();

		if (this.spellcasting) {
			return this.spellcasting;
		}

		this.spellcasting = new SpellcastingList();
		if (this.race.spellcasting) {
			this.spellcasting.add(
				this.race.spellcasting,
				this.race.name,
				this.abilities[this.race.spellcasting.ability].getMod(),
				0,
				[],
				{},
				profBonus
			);
		}
		this.classes.forEach(c => {
			var classSC = c.classData.spellcasting;
			if (classSC)
				this.spellcasting.add(
					classSC,
					c.name,
					this.abilities[classSC.ability].getMod(),
					c.level,
					c.slots,
					c.knownSpells,
					profBonus
				);
		});

		this.cards = new Cards(
			this.equipment.items,
			this.spellcasting.getKnownSpells(),
			this.features
		);

		return this.spellcasting;
	}
	getTotalLevel() {
		var level = 0;
		this.classes.forEach(c => {
			level += c.level;
		});
		return level;
	}
	getProficiencyBonus() {
		return proficiencyBonuses[this.getTotalLevel()];
	}
	printProficiencyBonus() {
		return appendPlus(this.getProficiencyBonus());
	}
	getHitDice() {
		return this.health.getHitDice(this.classes);
	}
	getHP() {
		return this.health.getHP(this.classes, this.abilities.Constitution);
	}
	/**
	 * @param {Feature} feature
	 */
	getFeatureUses(feature) {
		return feature.getUses(this.abilities, this.getTotalLevel());
	}
	/**
	 * @param {Feature} feature
	 */
	getFeatureDesc(feature) {
		return feature.getDesc(this.getTotalLevel(), this.abilities);
	}
	getClassLevel(name) {
		for (var i = 0; i < this.classes.length; i++) {
			if (this.classes[i].name === name) {
				return this.classes[i].level;
			}
		}
		return 0;
	}
	getSpellSlots() {
		if (!this.spellcasting) return [];

		return this.spellcasting.getSlots(this.classes);
	}
}

class Cards {
	constructor(items = [], knownSpells = [], features = []) {
		// find features that have spell cards
		var featureSpells = [];
		features.forEach(f => {
			let spell = spellStore.get(f.name);
			if (spell && spell.isFeature)
				featureSpells.push(new Card().setSpell(spell));
		});

		this.arr = items
			.map(i => new Card().setItem(i))
			.concat(knownSpells.map(s => new Card().setSpell(s)))
			.concat(featureSpells);
	}
	get() {
		return this.arr;
	}
}

class Card {
	constructor() {
		this.category = "";
		this.thing = false;
	}
	setItem(thing = false) {
		if (!thing) {
			console.error("thing must be defined");
			return this;
		}

		this.category = "Items";
		this.thing = thing;

		if (thing.name === "Talon") {
			console.log("HEY");
		}

		let data =
			!thing.data && thing.getIsa()
				? thing.getIsa().data
				: thing.data ? thing.data : {};

		// get spell data
		if (data && data.extend_spell) {
			// && spellStore.get(data.extend_spell)
			data = { ...spellStore.get(data.extend_spell), ...data };

			// remove At Higher Levels paragraph if not a wand
			if (
				data.description &&
				data.description[data.description.length - 1].startsWith(
					"At Higher"
				)
			) {
				data.description = data.description.splice(
					data.description.length - 1,
					1
				);
			}
		}

		this.name = thing.getName();
		this.damage = thing.data && data.damage ? data.damage : undefined;

		//Get the item description from the thing contains
		let description = [];
		if (thing.contains) {
			thing.contains.forEach(c => {
				if (typeof c === "string") description.push(c);
			});
		}
		this.description = data.description ? description.concat(data.description) : description;

		for (var name in data) {
			if (this[name] === undefined) this[name] = data[name];
		}
		return this;
	}
	setSpell(knownSpell = false) {
		if (!knownSpell) {
			console.error("thing must be defined");
			return this;
		}
		this.category = "Spells";
		for (var name in knownSpell) {
			this[name] = knownSpell[name];
		}
		return this;
	}
}

class AdvResist {
	constructor({ advantages = [], resistances = [], other = [] }) {
		this.advantages = advantages;
		this.resistances = resistances;
		this.other = other ? other.map(a => new Feature(a)) : [];
	}
}

class Health {
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

class Equipment {
	constructor(
		{
			hasShield = false,
			armor = false,
			weapons,
			containers = [],
			items = []
		},
		character
	) {
		if (armor) armor = armor.toLowerCase();
		// this.armor = armor && thingStore.exists(armor) ? thingStore.get(armor) : false;
		this.hasShield = !!hasShield;
		this.weapons = weapons;
		this.containers = containers.map(c => new Container(c));
		this.items = [];
		this.character = character;

		items.forEach(item => {
			/*if (thingStore.exists(item)) {
				this.items.push(thingStore.get(item));
				return;
			}
			item = item.toLowerCase();
			if (thingStore.exists(item)) this.items.push(thingStore.get(item));
			else console.error(item + " does not exist");*/
		});
	}
	getAC() {
		if (!this.armor) return this.getUnarmoredAC();

		const DEX = this.character.abilities.Dexterity.getMod();
		var ac = this.armor.data.AC;

		if (this.armor.data["Item Type"] === "Light Armor") {
			ac = ac + DEX;
		} else if (this.armor.data["Item Type"] === "Medium Armor") {
			if (DEX === 1) ac = ac + 1;
			else ac = ac + 2;
		}

		if (this.hasShield) {
			ac += 2;
		}

		return ac;
	}
	getUnarmoredAC() {
		var DEX = this.character.abilities.Dexterity.getMod();
		var CON = this.character.abilities.Constitution.getMod();
		var WIS = this.character.abilities.Wisdom.getMod();

		if (this.character.isClass("Barbarian")) return 10 + DEX + CON;
		if (this.character.isClass("Monk")) return 10 + DEX + WIS;
		if (this.character.isSubclass("Sorcerous Origin", "Draconic Bloodline"))
			return 13 + DEX;
		return 10 + DEX;
	}
	getUnshieldedAC() {
		if (this.hasShield) return this.getAC() - 2;
		else return this.getAC();
	}
}

class Container {
	constructor({ name, content }) {
		this.name = name;
		this.content = content;
	}
}

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

export class ClassInfo {
	constructor({
		name = "Fighter",
		level = 1,
		label = "",
		subclasses = {},
		knownSpells = {}
	}) {
		this.name = name;
		this.classData = classStore.get(name);
		this.level = level;
		this.label = label;
		this.knownSpells = knownSpells;
		this.subclasses = subclasses;
		this.slots = [];

		if (!this.classData.levels[this.level - 1]){
			console.error(
				"Can't find " +
					this.classData.name +
					" class data for level " +
					this.level
			);
		}
		else this.slots = this.classData.levels[this.level - 1].slots;
	}
	isSubclass(name, value) {
		return this.subclasses[name] === value;
	}
}

export class Background {
	constructor(
		{
			alignment = "Lawful Good",
			bond = "",
			flaw = "",
			feature,
			ideal = "",
			name = "Folk Hero",
			personality = "",
			specialty = "",
			startingCoin = "5gp"
		} = {}
	) {
		this.alignment = alignment;
		this.bond = bond;
		this.flaw = flaw;
		this.feature = feature;
		this.ideal = ideal;
		this.name = name;
		this.personality = personality;
		this.specialty = specialty;
		this.startingCoin = startingCoin;
	}
}

export class Body {
	constructor({ height, weight, age, hair, skin, eyes } = {}, speed) {
		this.height = height;
		this.weight = weight;
		this.age = age;
		this.hair = hair;
		this.skin = skin;
		this.eyes = eyes;
		this.speed = speed;
	}
}

function appendPlus(val) {
	if (val > 0) {
		return "+" + val;
	}
	return "" + val;
}
