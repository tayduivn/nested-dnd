
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

	if(typeof instance.data.mirrors === "string"){
		var index = thingStore.get(instance.data.mirrors).uniqueInstance;
		if(typeof index==='number'){
			instance.data.mirrors = index;
		}else return;
	}

	var mirrorInstance = instanceStore.get(instance.data.mirrors);
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
			child.data.mirrors = mirrorChild.id;
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
		thing.processIsa(true);
		return thing;
	}
}

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