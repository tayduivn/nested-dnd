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
	constructor(thing, parentId){

		if(!thing){
			throw new Error("Thing is required to make a new instance");
		}

		var result = thing.beforeMake(this);

		this.thing = result.thing;
		this.id = null;
		this.parent = (parentId) ? parentId : null;
		this.children = []; //indexes of children and string descriptions
		this.grown = false;
		
		this.data = thing.getData();
		this.name = thing.getName();
		this.icon = thing.getIcon();
		
		var { cssClass, textColor } = Styler.getClass(this.name, this.icon, thing, thing.getIsa(), instances[parentId]);
		this.textColor = textColor;
		this.cssClass = cssClass;

		this.id = instances.length;
		if(thing.isUnique() === true) 
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
		var blueprint = this.thing.getContains();

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
					var inst = instanceStore.add(thingStore.add(child), this.id);
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
			
			for (var ii=0; ii <  child.makeAmount; ii++){

				if(tableStore.isTableID(child.value) && child.isEmbedded){
					var insertThings = tableStore.get(child.value);
					blueprint.splice(i,1,...insertThings);
					i--;
					continue;
				}

				//do each time becuase could be rollable
				var value = tableStore.roll(child.value);

				if(!thingStore.exists(value)){ //this is just a plain string
					if(value.trim().length)
						children.push(value.trim()); 
					continue;
				}
				var thing = thingStore.get(value);

				if(child.isEmbedded){
					var contains = thing.getContains();
					if(contains && contains.length){
						blueprint.splice(i,1,...thing.contains);
						i--;
					}
				}else{
					var New = instanceStore.add(thing, this.id);  
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
	if(typeof index === "string" && thingStore.exists(index)){
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

instanceStore.add = function(thing, parentId){
	if(typeof thing === "undefined" || thing === null || thing === false)
		throw new Error("thing is required when creating an Instance.");

	if(typeof thing === "string")
		thing = thingStore.get(thing);

	if(thing && !thing.thingStore)
		throw new Error("thing must be an instanceof Thing. Tried to make instance with: "+thing);

	if(thing.uniqueInstance instanceof Number && instances[thing.uniqueInstance]){
		throw new Error("Cannot make more than one instance of "+thing.name);
	}
	
	var instance = new Instance(thing, parentId);
	instances.push(instance);
	return instance;
}

instanceStore.delete = function(instance){
	return instances.splice(instance.id, 1);
}

//convenience for packs to access Instance functions;
Instance.prototype.instanceStore = instanceStore;

export default instanceStore;