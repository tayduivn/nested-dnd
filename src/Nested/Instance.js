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
		this.id = null;
		this.name = null;
		this.parent = null;
		this.children = []; //indexes of children and string descriptions
		this.thing = thing;
		this.grown = false;
		this.icon = null;

		if(typeof thing === "undefined")
			throw new Error("thing is required when creating an Instance");

		if(!(thing instanceof Thing))
			throw new Error("thing must be an instanceof Thing");

		if(thing.isa && !Thing.exists(thing.isa))
			throw new Error("trying to extend a non-existent thing "+thing.isa);

		this.name = thing.getName();
		this.icon = thing.getIcon(this.name);
		this.cssClass = thing.cssClass;
		if(thing.autoColor)
			this.cssClass+=" "+Styler.strToColor(this.name);
		if(this.icon=="empty")
			this.cssClass+=" empty";

		//save
		this.id = instances.length;
		instances.push(this);
	}//contructor()

	getBlueprint(){
		var blueprint =this.thing.contains;
		if(this.thing.isa){
			var superThing = Thing.get(this.thing.isa);
			blueprint = 
				(this.thing.extend) ? superThing.contains.concat(this.thing.contains) 
				: (!this.thing.contains) ? superThing.contains 
				: this.thing.contains;
		}
		return blueprint;
	}

	getBGClass(){
		return this.icon.replace("gi g","")
  		.replace("fa flaticon-","i-")
  		.replace("fa fa-","i-")
  		.replace("fa-spin","")
  		.replace("gi-spin","")
  		.replace("animated","")
	}
	
	//process contains into instances
	grow(){
		this.children = [];
		var blueprint = this.getBlueprint();

		var children = this.children;
		for(var i = 0,child; i < blueprint.length; i++){
			child = blueprint[i];

			//this is a plain object, and was likely created in a Pack.
			if(child.constructor === ({}).constructor){
				if(child.type === "table"){
					child = new Table(child);
				}
				else{
					var inst = new Instance(new Thing(child));
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
export {instances};