import thingStore from './thingStore.js';
import tableStore from './tableStore.js';
import Styler from '../util/Styler.js';
import Contain from '../util/Contain.js';

let instances = [];

/**
 * thing <Thing>
 * 
 */
class Instance{
	constructor(thing){
		thing.beforeMake(this);

		this.id = null;
		this.parent = null;
		this.children = []; //indexes of children and string descriptions
		this.thing = thing;
		this.grown = false;
		this.name = thing.getName();
		this.icon = thing.getIcon();
		this.cssClass = thing.cssClass;
		this.textColor = thing.textColor;
		this.data = thing.data;

		if(thing.autoColor){
			var color = Styler.strToColor(this.name);
			if(color){
				this.cssClass+=" "+color;
				this.textColor = null;
			}
		}
		if(this.icon === "empty")
			this.cssClass += " empty";

		this.id = instances.length;
		if(thing.uniqueInstance === true) 
			thing.uniqueInstance = this.id;

		thing.afterMake(this);
	}//contructor()

	beforeRender(){
		this.thing.beforeRender(this);
	}

	//get instance of child by name of thing
	findChild(thingName){
		if(!this.grown) this.grow();

		for(var i = 0, child; i < this.children.length; i++){
			if(typeof this.children[i] === "string") continue;
			child = instances[this.children[i]];
			if(child.thing.name === thingName)
				return child;
		}
		return false;
	}
	
	//process contains into instances
	grow(){
		this.children = [];
		var blueprint = this.thing.contains;

		var children = this.children;
		for(var i = 0,child; i < blueprint.length; i++){
			child = blueprint[i];

			if(child === undefined){
				console.error("Child of "+this.name+" is undefined");
				return;
			}

			//this is a plain object, and was likely created in a Pack.
			if(child.constructor === ({}).constructor){
				if(child.type === "table"){
					child = tableStore.add(child);
				}
				else{
					var inst = instanceStore.add(thingStore.add(child));
					inst.parent = this.id;
					children.push(inst.id);
					continue;
				}
			}

			if(child.roll)
				child = child.roll();

			if(typeof child !== "string")
				throw new Error("child of "+this.name+" at index "+i+" is an unrecognized object: "+child);

			child = new Contain(child);

			if(!child.isIncluded()) continue;

			//this is just a plain string
			if(!thingStore.exists(child.value)){
				if(child.value.trim().length)
					children.push(child.value.trim()); 
				continue;
			}

			var thing = thingStore.get(child.value);
			for (var ii=0; ii <  child.makeAmount; ii++){
				if(child.isEmbedded){
					var insertThings = thing.contains;
					blueprint.splice(i,1,...insertThings);
					i--;
				}else{
					var New = instanceStore.add(thing);  
					New.parent=this.id;
					children.push(New.id);
				}
			}
		};//for each child

		this.grown = true;
	}//grow()
}

var instanceStore = {};
instanceStore.get = function(index){
	if(typeof index == "string" && thingStore.exists(index)){
		var thing = thingStore.get(index);
		if(thing.uniqueInstance !== false) 
			return instances[thing.uniqueInstance];
		console.error("Could not find instance with name \""+index+"\"");
		return;
	}
	if(isNaN(index) || index > instances.length){
		console.error("Invalid index "+index+" when trying to get instance.");
	}
	return instances[index];
}

instanceStore.add = function(thing){
	if(typeof thing === "undefined")
		throw new Error("thing is required when creating an Instance");

	if(thing.constructor.name !== "Thing")
		throw new Error("thing must be an instanceof Thing");

	if(thing.isa && !thingStore.exists(thing.isa))
		throw new Error("trying to extend a non-existent thing "+thing.isa);

	if(thing.uniqueInstance instanceof Number && instances[thing.uniqueInstance]){
		throw new Error("Cannot make more than one instance of "+thing.name);
	}
	
	var instance = new Instance(thing);
	instances.push(instance);
	return instance;
}

//convenience for packs to access Instance functions;
Instance.prototype.instanceStore = instanceStore;

export default instanceStore;