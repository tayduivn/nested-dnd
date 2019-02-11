import classStore from "./classStore";

export class ClassInfo {
	constructor({ name = "Fighter", level = 1, label = "", subclasses = {}, knownSpells = {} }) {
		this.name = name;
		this.classData = classStore.get(name);
		this.level = level;
		this.label = label;
		this.knownSpells = knownSpells;
		this.subclasses = subclasses;
		this.slots = [];

		if (!this.classData.levels[this.level - 1]) {
			/*console.error(
				"Can't find " +
					this.classData.name +
					" class data for level " +
					this.level
			);*/
		} else this.slots = this.classData.levels[this.level - 1].slots;
	}
	isSubclass(name, value) {
		return this.subclasses[name] === value;
	}
}

export class Background {
	constructor({
		alignment = "Lawful Good",
		bond = "",
		flaw = "",
		feature,
		ideal = "",
		name = "Folk Hero",
		personality = "",
		specialty = "",
		startingCoin = "5gp"
	} = {}) {
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
