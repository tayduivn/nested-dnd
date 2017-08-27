import Thing from './Thing.js';
import Table from './Table.js';
import Styler from './Styler.js';

let instances = [];

/**
 * thing <Thing>
 * 
 */
class Instance{
	constructor(thing){
		if(typeof thing === "undefined")
			throw new Error("thing is required when creating an Instance");

		if(!(thing instanceof Thing))
			throw new Error("thing must be an instanceof Thing");

		if(thing.isa && !Thing.exists(thing.isa))
			throw new Error("trying to extend a non-existent thing "+thing.isa);

		if(thing.uniqueInstance instanceof Number && instances[thing.uniqueInstance]){
			throw new Error("Cannot make more than one instance of "+thing.name);
		}

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

		//save
		this.id = instances.length;
		if(thing.uniqueInstance === true) thing.uniqueInstance = this.id;
		instances.push(this);

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
			if(child.thing.name == thingName)
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
					child = new Table(child);
				}
				else{
					var inst = new Instance(Thing.add(child));
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
			if(!Thing.exists(child.value)){
				if(child.value.trim().length)
					children.push(child.value.trim()); 
				continue;
			}

			var thing = Thing.get(child.value);
			for (var ii=0; ii <  child.makeAmount; ii++){
				if(child.isEmbedded){
					var insertThings = thing.contains;
					blueprint.splice(i,1,...insertThings);
					i--;
				}else{
					var New = new Instance(thing);  
					New.parent=this.id;
					children.push(New.id);
				}
			}
		};//for each child

		this.grown = true;
	}//grow()
}

//convenience for packs to access Instance functions;
Instance.prototype.Instance = Instance;

Instance.get = function(index){
	if(isNaN(index) || index > instances.length){
		console.error("Invalid index "+index+" when trying to get instance.");
	}
	return instances[index];
}


function Contain(string){
	if(typeof string !== "string"){
		throw new Error("expecting string");
	}

	this.value = Table.roll(string);
	this.makeProb = 100;
	this.makeAmount = 1;
	this.isEmbedded = false;

	//extract modifiers out of the value
	var doEmbed = string.charAt(0) === ".";
	if(doEmbed){
		this.isEmbedded = true;
		this.value = string.substring(1);
	}

	var valueArray = this.value.split(",");
	if (typeof valueArray[1]!=="undefined" && !isNaN(valueArray[1].split("-")[0].split("%")[0] )){
		extractModifiers.call(this,valueArray[1]);
		this.value = valueArray[0];
	}

	function extractModifiers(mod){
		if(typeof mod !== "string")
			throw new Error("modifiers need to be strings. Can be %, amount, or range")

		if(mod === "."){
			this.isEmbedded = true;
			return;
		}

		//percentage
		mod=mod.split("%");
		if (mod[1] !== undefined){
			this.makeProb = mod[0];
			return;
		}
		mod = mod[0];

		//range
		mod=mod.split("-");
		if (typeof mod[1] === "undefined") this.makeAmount = mod[0];
		else
			this.makeAmount = Math.rand(mod[0],mod[1]);
	}
	this.isIncluded = function(){
		return Math.random()*100<=this.makeProb;
	}
}

export default Instance;
export {Contain};