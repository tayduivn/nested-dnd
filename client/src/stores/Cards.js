import spellStore from "./spellStore";

export const proficiencyBonuses = [
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

export function appendPlus(val) {
	if (val > 0) {
		return "+" + val;
	}
	return "" + val;
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
				: thing.data
					? thing.data
					: {};

		// get spell data
		if (data && data.extend_spell) {
			// && spellStore.get(data.extend_spell)
			data = { ...spellStore.get(data.extend_spell), ...data };

			// remove At Higher Levels paragraph if not a wand
			if (
				data.description &&
				data.description[data.description.length - 1].startsWith("At Higher")
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
		this.description = data.description
			? description.concat(data.description)
			: description;

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

export default class Cards {
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
