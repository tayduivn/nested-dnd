var pack = {
	author: "Cattegy",
	defaultSeed: "",
	dependencies: ["dnd"],
	description: "",
	name: "dnd-js",
	version: "0.0.0",
	things: {},
	tables: {}
};

pack.things["mirror plane"] = {
	beforeRender: function(instance) {
		if (typeof instance.data.mirrors === "undefined") return;

		var instanceStore = instance.instanceStore;
		var thingStore = this.thingStore;

		if (typeof instance.data.mirrorsID === undefined) {
			var index = thingStore.get(instance.data.mirrors).uniqueInstance;
			if (typeof index === "number") {
				instance.data.mirrorsID = index;
			} else return;
		}

		var mirrorInstance = instanceStore.get(instance.data.mirrorsID);
		if (!mirrorInstance.grown) mirrorInstance.grow();

		if (
			instance.data.mirrorChildrenCopy ===
			JSON.stringify(mirrorInstance.children)
		) {
			return;
		}

		//TODO: copy contents of children and transform
		instance.children = [];
		mirrorInstance.children.forEach(function(mirrorChild) {
			if (typeof mirrorChild === "number") {
				mirrorChild = instanceStore.get(mirrorChild);

				//create a new mirror plane thing
				var childThing = styleAThing(mirrorChild.thing, "mirror plane");

				//create new child and copy mirror
				var child = instanceStore.add(childThing);
				var newId = child.id;
				Object.assign(child, mirrorChild);
				child.id = newId;
				child.parent = instance.id;
				child.thing = childThing;
				child.data.mirrorsID = mirrorChild.id;
				child.data.mirrorChildrenCopy = null;

				instance.children.push(child.id);
				return;
			}

			instance.children.push(mirrorChild);
			return;
		});
		if (instance.children.length !== mirrorInstance.children.length) {
			console.error(
				"Error while mirroring an instance: ended up with " +
					instance.children.length +
					" children when there need to be " +
					mirrorInstance.children.length
			);
		}

		instance.data.mirrorChildrenCopy = JSON.stringify(mirrorInstance.children);
	}
};
pack.things["undead mirror plane"] = {
	beforeRender: function(instance) {
		createMirrorPlane(instance, "undead mirror plane");
	}
};
pack.things["fey mirror plane"] = {
	beforeRender: function(instance) {
		createMirrorPlane(instance, "fey mirror plane");
	}
};
pack.things["ethereal mirror plane"] = {
	beforeRender: function(instance) {
		createMirrorPlane(instance, "ethereal mirror plane");
	}
};

pack.things["monster"] = {
	beforeMake: function(instance, tableStore) {
		var statblocks = false;

		//generic group, needs to set statblock from data settings
		if (this.name === "humanoid" || this.name === "monster") {
			statblocks = findAncestorData(instance, "statblocks");
			if (!statblocks) statblocks = tableStore.get("DEFAULT STATBLOCKS");
		} else if (this.name === "livestock") {
			statblocks = findAncestorData(instance, "livestock");
			if (!statblocks) statblocks = tableStore.get("DEFAULT LIVESTOCK");
		} else if (this.name === "mount") {
			statblocks = findAncestorData(instance, "mounts");
			if (!statblocks) statblocks = tableStore.get("DEFAULT MOUNTS");
		} else if (this.name === "pet") {
			statblocks = findAncestorData(instance, "pets");
			if (!statblocks) statblocks = tableStore.get("DEFAULT PETS");
		}

		if (statblocks) {
			var statblock = tableStore.roll(statblocks);
			return {
				thing: this.thingStore.exists(statblock)
					? this.thingStore.get(statblock)
					: this
			};
		} else {
			return { thing: this };
		}
	}
};

pack.things["humanoid"] = {
	afterMake: function(instance, tableStore) {
		var gender = instance.data.gender;
		var race = instance.data.race;
		var age = instance.data.age;
		var ageGroup = instance.data.ageGroup;
		var name = instance.name;

		// get gender
		var transgender = false;
		if (!gender) {
			gender =
				Math.rand(1, 250) === 1
					? "genderqueer"
					: Math.rand(0, 1)
						? "male"
						: "female";
			transgender = Math.rand(1, 250) === 1;
		}

		// get race
		if (race === undefined || race === "any") {
			race = checkIsa(this, "playable race") ? this.name : false;
			if (!race) {
				var demographics = findAncestorData(instance, "race-demographics");
				if (demographics) {
					race = tableStore.roll(demographics);
				}
			}
		}
		if (!race) race = "human";

		//get race data
		var raceThing = this.thingStore.get(race);
		var raceData = this.thingStore.get(race).getData();
		var maxAge = raceData["age max"];
		var adultAge = raceData["age adult"];
		if (!raceThing._data || !raceThing._data.threshold1) {
			var diff = maxAge - adultAge;
			raceThing._data = {
				threshold1: Math.floor(0.0625 * diff + adultAge),
				threshold2: Math.floor(0.3125 * diff + adultAge),
				threshold3: Math.floor(0.5625 * diff + adultAge)
			};
		}
		var threshold1 = raceThing._data.threshold1;
		var threshold2 = raceThing._data.threshold2;
		var threshold3 = raceThing._data.threshold3;

		//get age
		if (age === undefined) {
			if (ageGroup === undefined)
				ageGroup = tableStore.get("AGE GROUPS").roll();

			if (ageGroup === "young adult") age = Math.rand(adultAge, threshold1);
			else if (ageGroup === "adult")
				age = Math.rand(threshold1 + 1, threshold2);
			else if (ageGroup === "middle aged")
				age = Math.rand(threshold2 + 1, threshold3);
			else age = Math.rand(threshold3 + 1, adultAge);
		} else {
			if (age <= adultAge) ageGroup = "child";
			if (age <= threshold1) ageGroup = "young adult";
			else if (age <= threshold2) ageGroup = "adult";
			else if (age <= threshold3) ageGroup = "middle aged";
			else ageGroup = "elderly";
		}

		//if name is capitalized, return
		var label = "";
		if (this.isUnique()) {
			if (!this.namegen && this.isa && this.isa !== "humanoid") {
				if (race !== "human") label += race + " ";
				if (this.isa !== "commoner") label += this.isa;

				// append label
				if (label.length) {
					name = name + " (" + label.trim() + ")";
				}
			}
		} else {
			//get name
			if (race !== "human") label += race + " ";
			if (
				this.name !== "commoner" &&
				this.name !== "humanoid" &&
				race !== this.name
			)
				label += this.name;

			if (name === this.name) {
				var tablename = "";
				if (tableStore.exists(this.name.toUpperCase() + " NAME")) {
					tablename = this.name.toUpperCase() + " NAME";
				} else {
					if (race === "human") {
						tablename += "HUMAN ";
					}
					if (gender === "male" || gender === "female") {
						tablename += gender.toUpperCase() + " ";
					} else {
						tablename += ["FEMALE", "MALE"].roll() + " ";
					}
					tablename += "NAME";
				}

				name = tableStore.get(tablename).roll();

				// TEMPORARY - store names
				var generatedNames = localStorage["generatedNames"];
				if (!generatedNames) {
					generatedNames = [];
				} else {
					generatedNames = JSON.parse(generatedNames);
				}
				generatedNames.push(name);
				localStorage.generatedNames = JSON.stringify(generatedNames);

				if (label.length) name = name + " (" + label.trim() + ")";
			}
		}

		// append trans
		if (gender !== "genderqueer" && transgender) {
			gender = "transgender " + gender;
		}

		var data = {
			race: race,
			gender: gender,
			age: age,
			ageGroup: ageGroup
		};
		instance.name = name;
		instance.data = Object.assign({}, instance.data, data);
	}
};

pack.things["humanoid description"] = {
	afterMake: function(instance) {
		var gender = findAncestorData(instance, "gender");
		var race = findAncestorData(instance, "race");
		var age = findAncestorData(instance, "age");

		instance.name = "";

		if (gender !== "male" && gender !== "female") instance.name += gender + " ";
		if (race !== "human") instance.name += race + " ";

		instance.name += age + " years old ";

		if (race !== "human")
			instance.name += "(" + findAncestorData(instance, "ageGroup") + ")";
	}
};
function findAncestorData(instance, property) {
	if (!instance.parent) return undefined;

	if (instance.data && instance.data[property] !== undefined)
		return instance.data[property];

	return findAncestorData(
		instance.instanceStore.get(instance.parent),
		property
	);
}

function checkIsa(thing, str) {
	if (!thing.isa) {
		return false;
	}
	if (thing.isa === str) {
		return thing.name;
	}
	return checkIsa(thing.thingStore.get(thing.isa), str);
}

/* 
TODO ICONS

DISABLED
blindfold, blind
silenced

HARMED
pummeled
coma
vomiting
one-eyed
internal injury

SAD
tear
frown

shrug
sleepy
frown

*/

/*
var genderedThings = {};
pack.things["person"]={
	beforeMake:function(instance){
	
		const gender = (Math.rand(0,1)) ? "man" : "woman";
		const originalThing = this;
		const things = this.thingStore;
		const newThingName = this.name+" "+gender;

		if(genderedThings[newThingName]){
			return genderedThings[newThingName];
		}

		var createName = function(){
			var suffix = (originalThing.name !== "person") ? originalThing.getName() : "";
			var baseName = (gender === "man") ? things.get("man").getName() : things.get("woman").getName();
			return baseName+" "+suffix;
		}

		var newIsa = (this.isa === "person") ? gender : this.isa;

		var thing = things.add({...this, name: null, isa: newIsa});
		thing.getName = createName.bind(thing);

		genderedThings[newThingName] = thing;
		return thing;
	}
}
*/

function createMirrorPlane(instance, name) {
	var instanceStore = instance.instanceStore;
	var thingStore = this.thingStore;
	var thing = thingStore.get(name);

	instance.children.forEach(function(child) {
		if (typeof child !== "number") return;
		child = instanceStore.get(child);
		child.background = thing.background;
		child.textColor = thing.textColor;
		if (child.cssClass.indexOf(thing.background) === -1)
			child.cssClass = " " + thing.background;
		if (
			child.data.mirrors !== undefined &&
			instanceStore.get(child.data.mirrors).thing.contains
		) {
			child.thing = styleAThing(child.thing, name);
		}
	});
}

function styleAThing(thing, styleName) {
	var prefix = styleName.split(" ")[0] + " ";
	if (thing.isa && thing.isa.startsWith(styleName)) {
		return thing;
	}
	var thingStore = thing.thingStore;

	var originalThing = thing.name;
	if (!originalThing) originalThing = "";
	if (thingStore.exists(prefix + originalThing)) {
		return thingStore.get(prefix + originalThing);
	}

	thing = thingStore.add({
		name: prefix + originalThing,
		isa: originalThing
	});
	thing.isa = styleName;

	return thing;
}

module.exports = pack;
