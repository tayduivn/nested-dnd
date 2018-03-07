const DEBUG_FEATURE = "Martial Arts";

class ClassStore {
	constructor() {
		this.classes = {};
	}
	addAll(classes = {}) {
		this.classes = { ...this.classes, ...classes };
	}
	getAll() {
		var classes = {};
		for (var name in this.classes) {
			classes[name] = new PlayerClass(this.classes[name]);
		}
		return classes;
	}
	get(name) {
		if(!this.classes[name]){
			console.error("Can't find class with name "+name);
		}
		var c = this.classes[name] ? this.classes[name] : {};
		return new PlayerClass(c);
	}
	getNames() {
		return Object.keys(this.classes).sort();
	}
}

class PlayerClass {
	constructor({
		name = "",
		proficiencies = {},
		spellcasting = false,
		subclasses = {},
		equipment = [],
		hit_dice = 0,
		level = [],
		main_ability = false
	}) {
		this.name = name;
		this.mainAbility = main_ability;
		this.proficiencies = proficiencies;
		this.spellcasting = spellcasting;
		this.subclasses = subclasses;
		this.equipment = equipment;
		this.hitDice = hit_dice;
		this.levels = level;
	}
	getFeaturesAtLevel(currentLevel, subclasses = {}) {
		var features = [];
		for (var i = 0; i < currentLevel; i++) {
			var level = this.levels[i];

			for (var name in level) {
				var feature = level[name];
				var desc = feature.desc;

				if (name === DEBUG_FEATURE) {
					console.log(DEBUG_FEATURE + " raw");
					console.log(feature);
				}

				if (name === "slots") continue;

				//description
				if (subclasses[name]) {
					// it is the subclass category (the superclass)
					if (desc && desc.length)
						desc += subclasses[name]; // add the subclass choice to the desc of the superclass
					else desc = false;
				} else if (feature.subclass) {
					let subclassName = feature.subclass[feature.subclass.length-1]; // 1
					let superclassName = feature.subclass[feature.subclass.length-2]; // 0
					if (
						subclasses[subclassName] === name || // it is the chosen subclass
						(subclasses[superclassName]  && subclasses[superclassName] === subclassName) // it is a feature of the chosen subclass
					) {
						if (
							desc !== false &&
							desc === "" &&
							feature.description
						)
							desc = feature.description;
					} else continue;
				}

				let returnData = {
					...feature,
					name: name,
					desc: desc,
					className: this.name,
					notes: "level " + (i + 1) + " " + this.name
				};

				if (name === DEBUG_FEATURE) {
					console.log(DEBUG_FEATURE + " final");
					console.log(returnData);
				}

				features.push(returnData);
			}
		}
		return features;
	}
}

class RaceStore {
	constructor() {
		this.races = {};
	}
	addAll(races = {}) {
		this.races = { ...this.races, ...races };
	}
	getAll() {
		var races = {};
		for (var name in this.races) {
			races[name] = new Race(this.races[name]);
		}
		return races;
	}
	get(name) {
		var c = this.races[name] ? this.races[name] : {};
		return new Race(c);
	}
	getNames() {
		return Object.keys(this.races).sort();
	}
	getOptions() {
		var options = [];
		this.getNames().forEach(name => {
			options.push({
				label: this.races[name].name,
				value: name
			});
		});
		return options;
	}
}

class Race {
	constructor({
		name = "",
		label = "",
		proficiencies = {},
		abilities = {},
		size = "Medium",
		speed = 30,
		features = {},
		advResist = {},
		spellcasting
	}) {
		this.name = name;
		this.label = label;
		this.proficiencies = proficiencies;
		this.abilities = abilities;
		this.size = size;
		this.speed = speed;
		this.features = features;
		this.advResist = advResist;
		this.spellcasting = spellcasting;
	}
}

class BackgroundStore {
	constructor() {
		this.backgrounds = {};
	}
	addAll(backgrounds = {}) {
		this.backgrounds = { ...this.backgrounds, ...backgrounds };
	}
	getAll() {
		var backgrounds = {};
		for (var name in this.backgrounds) {
			backgrounds[name] = new Background(this.backgrounds[name]);
		}
		return backgrounds;
	}
	get(name) {
		var c = this.backgrounds[name] ? this.backgrounds[name] : {};
		return new Background(c);
	}
	getNames() {
		return Object.keys(this.backgrounds).sort();
	}
}

class Background {
	constructor({
		name = "",
		proficiencies = {},
		size = "Medium",
		speed = 30,
		feature = {},
		advantages = {},
		equipment = []
	}) {
		this.name = name;
		this.proficiencies = proficiencies;
		this.size = size;
		this.speed = speed;
		this.feature = feature;
		this.advantages = advantages;
		this.equipment = equipment;
	}
}

let classStore = new ClassStore();
let raceStore = new RaceStore();
let backgroundStore = new BackgroundStore();
export default classStore;
export { raceStore, backgroundStore };
