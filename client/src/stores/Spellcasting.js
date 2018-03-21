import spellStore from "./spellStore";

const skillAbbrev = {
	Strength: "str",
	Dexterity: "dex",
	Constitution: "con",
	Intelligence: "int",
	Wisdom: "wis",
	Charisma: "cha"
};

const multiclassSpellSlots = [
	[2],
	[3],
	[4, 2],
	[4, 3],
	[4, 3, 2],
	[4, 3, 3],
	[4, 3, 3, 1],
	[4, 3, 3, 2],
	[4, 3, 3, 3, 1],
	[4, 3, 3, 3, 2],
	[4, 3, 3, 3, 2, 1],
	[4, 3, 3, 3, 2, 1],
	[4, 3, 3, 3, 2, 1, 1],
	[4, 3, 3, 3, 2, 1, 1],
	[4, 3, 3, 3, 2, 1, 1, 1],
	[4, 3, 3, 3, 2, 1, 1, 1],
	[4, 3, 3, 3, 2, 1, 1, 1, 1],
	[4, 3, 3, 3, 3, 1, 1, 1, 1],
	[4, 3, 3, 3, 3, 2, 1, 1, 1],
	[4, 3, 3, 3, 3, 2, 2, 1, 1]
];

export default class SpellcastingList {
	constructor() {
		this.list = [];
		this.totalSpells = 0;
	}
	add(spellcasting, name, modifier, level, slots, knownSpells, profBonus) {
		if (!spellcasting) return;

		spellcasting = new Spellcasting(spellcasting, name);
		spellcasting.dc = 8 + modifier + profBonus;
		spellcasting.learnSpells(knownSpells);

		var classSpells;

		if (name === "Cleric" || name === "Druid") {
			var highestSpellSlot = 0;
			slots.forEach((num, i) => {
				if (highestSpellSlot) return;
				if (slots[i + 1] === 0 || slots[i + 1] === undefined)
					highestSpellSlot = i;
			});
			classSpells = spellStore.getClassSpells(name, highestSpellSlot);
			spellcasting.learnSpells({ spells: classSpells });
		}

		var prepares =
			name === "Druid" ||
			name === "Wizard" ||
			name === "Cleric" ||
			name === "Paladin";

		this.list.push({
			name: name,
			title: (name) ? name.replace(/ \(.*\)/g, "") + " Spells" : "",
			spellcasting: spellcasting,
			prepares: prepares,
			numPrepared: level + modifier,
			level: level,
			slots: slots
		});

		this.totalSpells += spellcasting.spells.length;
	}
	getKnownSpells() {
		var spells = [];
		this.list.forEach(sc => {
			spells = spells.concat(sc.spellcasting.spells);
		});

		spells = spells.map(s => spellStore.get(s.name));
		return spells;
	}
	getCasterLevels() {
		var totalLevels = 0;
		var casterLevels = [];

		this.list.forEach(c => {
			switch (c.name) {
				case "Bard":
				case "Cleric":
				case "Druid":
				case "Sorcerer":
				case "Wizard":
				case "Warlock":
					casterLevels.push(c);
					totalLevels += c.level;
					break;
				case "Paladin":
				case "Ranger":
				case "Ranger (Revised)":
					casterLevels.push(c);
					totalLevels += Math.floor(c.level / 2);
					break;
				case "Fighter":
				case "Rogue":
					if (!c.subclasses || !c.subclasses.length) break;
					if (
						c.subclasses["Martial Archetype"] === "Eldritch Knight" ||
						c.subclasses["Roguish Archetype"] === "Arcane Trickster"
					) {
						casterLevels.push(c);
						totalLevels += Math.floor(c.level / 3);
					}
					break;
				default:
			}
		});
		return {
			total: totalLevels,
			casterLevels: casterLevels
		};
	}
	getSlots() {
		var { totalLevels, casterLevels } = this.getCasterLevels();
		if (casterLevels.length > 1) {
			return multiclassSpellSlots[totalLevels];
		}
		if (casterLevels.length === 0) return [];

		return casterLevels[0].slots;
	}
}

class Spellcasting {
	constructor(
		{ spells = [], ability, dc, notes = {}, ritual_cast = false },
		source
	) {
		this.spells = spells.map
			? spells.map(s => new KnownSpell(s, notes[s]))
			: [];
		this.ability = ability;
		this.dc = dc;
		this.notes = notes;
		this.ritual_cast = !!ritual_cast;
		this.source = source;

		this.spells.sort((a, b) => {
			return a.name.localeCompare(b.name);
		});
	}
	knowSpell(name) {
		return this.spells.find(s => s.name === name);
	}
	learnSpells(obj) {
		if (!obj) return;
		if (!obj.spells || !obj.spells.forEach) {
			return;
		}
		if (!obj.notes) obj.notes = {};

		obj.spells.forEach(name => {
			if (!this.knowSpell(name))
				this.spells.push(new KnownSpell(name, obj.notes[name]));
		});
		this.spells.sort((a, b) => {
			return a.name ? a.name.localeCompare(b.name) : true;
		});
	}
	printAbility() {
		return (skillAbbrev[this.ability]) ? skillAbbrev[this.ability].toUpperCase() : "";
	}
	spellsByLevel() {
		var levels = [];
		this.spells.forEach(s => {
			var data = s.getData();
			if (!data) {
				console.error("Couldn't find spell " + s);
				return;
			}

			if (!levels[data.level]) levels[data.level] = [];
			levels[data.level].push(s);
		});
		return levels;
	}
}

class KnownSpell {
	constructor(name, note) {
		this.name = name;
		this.note = note;
		this.prepared = false;

		if ((note && note.includes("prepared")) || this.getData().level === 0) {
			this.note = "";
			this.prepared = true;
		}
	}
	getData() {
		var spell = spellStore.get(this.name);
		if(!spell){
			return {};
		}
		return spell;
	}
}

/*
class SpellListAbility{
	constructor(ability, numPrepared){
		this.ability = ability;
		this.numPrepared = numPrepared;
		this.sources = [];
		this.prepares = false;
		this.spellsByLevel = [];
		this.totalSpells = 0;
	}
	addSpells(arr){
		if(!arr) return;
		arr.forEach((level,i)=>{
			if(!this.spellsByLevel[i])
				this.spellsByLevel[i] = [];
			this.spellsByLevel[i].push(...level);
			this.totalSpells += level.length;
		});
	}
	addSource(str){
		if(str === "Druid" || str === "Wizard" || str === "Cleric" || str === "Paladin"){
			this.prepares = true;
		}
		this.sources.push(str);
	}
	getNumPrepared(){
		if(!this.prepares)
			return false;
		return this.modifier;
	}
	printAbility(){
		return skillAbbrev[this.ability].toUpperCase()
	}
	printTitle(){
		return this.sources.join(" ")+" Spells";
	}
}

class SpellList{
	constructor(race, classes, abilities){
		this.list = [];

		this.addSpellcasting(race.spellcasting, race.name);
		classes.forEach((c)=>this.addSpellcasting(c.spellcasting, c.name))
	}
	list(){
		return ABILITIES.map(a=>this[a]);
	}
	getSpellCount(){
		var count = 0;
		ABILITIES.forEach(a=>{
			if(this[a]) count+= this[a].totalSpells;
		})
		return count;
	}
	addSpellcasting(spellcasting, source){
		if(!spellcasting) return;
		this.list.push(new SpellListAbility())
		this[spellcasting.ability].addSource(source);
		this[spellcasting.ability].addSpells(spellcasting.spellsByLevel());
	}
	
}*/
