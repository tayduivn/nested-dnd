
var pack = {
	"author": "Cattegy",
	"defaultSeed": "",
	"dependencies": ["dnd"],
	"description": "",
	"name": "dnd-js",
	"version": "0.0.0",
	"things": {
		
	},
	"tables": {}
};

pack.things["mirror plane"] ={ beforeRender: function(instance){
	if(typeof instance.data.mirrors === "undefined") return;

	var instanceStore = instance.instanceStore;
	var thingStore = instance.thing.thingStore;

	if(typeof instance.data.mirrorsID === undefined){
		var index = thingStore.get(instance.data.mirrors).uniqueInstance;
		if(typeof index==='number'){
			instance.data.mirrorsID = index;
		}else return;
	}

	var mirrorInstance = instanceStore.get(instance.data.mirrorsID);
	if(!mirrorInstance.grown) 
		mirrorInstance.grow();

	if(instance.data.mirrorChildrenCopy === JSON.stringify(mirrorInstance.children)){
		return;
	}

	//TODO: copy contents of children and transform
	instance.children = [];
	mirrorInstance.children.forEach(function(mirrorChild){
		if(typeof mirrorChild==="number"){
			mirrorChild = instanceStore.get(mirrorChild);

			//create a new mirror plane thing
			var mirrorThing = mirrorChild.thing;
			var childThing = styleAThing(mirrorChild.thing,"mirror plane");

			//create new child and copy mirror
			var child = instanceStore.add(childThing);
			var newId = child.id;
			Object.assign(child,mirrorChild);
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
	if(instance.children.length != mirrorInstance.children.length){
		console.error("Error while mirroring an instance: ended up with "+instance.children.length+" children when there need to be "+mirrorInstance.children.length);
	}

	instance.data.mirrorChildrenCopy = JSON.stringify(mirrorInstance.children);
}}
pack.things["undead mirror plane"] ={ beforeRender: function(instance){
	createMirrorPlane(instance, "undead mirror plane");
}}
pack.things["fey mirror plane"] ={ beforeRender: function(instance){
	createMirrorPlane(instance, "fey mirror plane");
}}
pack.things["ethereal mirror plane"] ={ beforeRender: function(instance){
	createMirrorPlane(instance, "ethereal mirror plane");
}}
pack.things["humanoid"] = {
	afterMake: function(instance, tableStore){

		// get gender
		var gender = instance.data.gender;
		var transgender = false;
		if(!gender){
			gender = instance.data.gender = (Math.rand(1,250) === 1) ? "genderqueer" : (Math.rand(0,1)) ? "male" : "female";
			transgender = (Math.rand(1,100) === 1);
		}

		// get race
		if(instance.data.race === undefined){
			instance.data.race = (checkIsa(instance.thing,"playable race")) ? instance.thing.name : false;
			if(!instance.data.race){
				var demographics = findAncestorData(instance,"race-demographics");
				if(demographics){
					instance.data.race = tableStore.roll(demographics);
				}
			}
		}
		if(!instance.data.race) instance.data.race = "human";
		var raceData = instance.thing.thingStore.get(instance.data.race).getData();

		//get age
		if(instance.data.age === undefined){
			var maxAge = raceData["age max"];
			var adultAge = raceData["age adult"];
			var diff = maxAge-adultAge;
			var threshold1 = Math.floor(0.0625*diff+adultAge);
			var threshold2 = Math.floor(0.3125*diff+adultAge);
			var threshold3 = Math.floor(0.5625*diff+adultAge);

			var ageGroup = tableStore.get("AGE GROUPS").roll();
			if(ageGroup === "young adult"){
				instance.data.age = Math.rand(adultAge,threshold1);
			}
			else if(ageGroup === "adult"){
				instance.data.age = Math.rand(threshold1+1,threshold2);
			}
			else if(ageGroup === "middleAged"){
				instance.data.age = Math.rand(threshold2+1,threshold3);
			}
			else{
				instance.data.age = Math.rand(threshold3+1,adultAge);
			}
		}
		
		//if name is capitalized, return
		if(instance.thing.isUnique()){
			if(!instance.thing.namegen && instance.thing.isa && instance.thing.isa !== "humanoid")
				instance.name = instance.name+" ("+instance.thing.isa+")";
		}
		else{
			//get name
			var name = instance.name;
			if(instance.name === this.name){
				if(gender === "male"){
					name = tableStore.get("MALE NAME").roll();
				}
				else if(gender === "male"){
					name = tableStore.get("FEMALE NAME").roll();
				}
				else{
					name = tableStore.get(["FEMALE","MALE"].roll()+" NAME").roll();
				}
				instance.name = name+" ("+this.name+")";
			}
		}

		if(instance.data.gender !== "genderqueer" && transgender){
			instance.data.gender = "transgender "+instance.data.gender;
		}

		// put person description in
		var msg = instance.data.gender+" "+instance.data.race+", "+instance.data.age+" years old";
		instance.children.push(msg);
	}
}

function findAncestorData(instance, property){
	if(!instance.parent)
		return undefined;

	if(instance.data[property] !== undefined)
		return instance.data[property];
	
	return findAncestorData(instance.instanceStore.get(instance.parent), property);
}

function checkIsa(thing, str){
	if(!thing.isa){
		return false;
	}
	if(thing.isa === str){
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

function createMirrorPlane(instance, name){
	var instanceStore = instance.instanceStore;
	var thingStore = instance.thing.thingStore;
	var thing = thingStore.get(name);

	instance.children.forEach(function(child){
		if(typeof child !== "number") return;
		child = instanceStore.get(child);
		child.background = thing.background;
		child.textColor = thing.textColor;
		if(child.cssClass.indexOf(thing.background) === -1)
			child.cssClass = " "+thing.background;
		if(child.data.mirrors !== undefined && instanceStore.get(child.data.mirrors).thing.contains){
			child.thing = styleAThing(child.thing,name);
		}
	});
}

function styleAThing(thing, styleName){
	var prefix = styleName.split(" ")[0]+" ";
	if(thing.isa && thing.isa.startsWith(styleName)){
		return thing;
	}
	var thingStore = thing.thingStore;

	var originalThing = thing.name;
	if(!originalThing) originalThing = "";
	if(thingStore.exists(prefix+originalThing)){
		return thingStore.get(prefix+originalThing);
	}

	thing = thingStore.add({
		"name": prefix+originalThing,
		"isa": originalThing
	});
	thing.isa = styleName;

	return thing;
}


module.exports = pack;