import tableStore from './tableStore.js';
import Styler from '../util/Styler.js';
import Contain from '../util/Contain.js'

import { binaryFind, valueIsUndefined } from '../util/util.js';

let things = {};
let thingStore = {};

thingStore.isaOptions = []; // generic options to select from a dropdown
thingStore.sortedThingNames = []; 

const BLANK_NAME = " ";

let updateCallbacks = {};
var DEBUG = true;
var DEBUG_THING = "Talon";

class Thing{
	constructor(options){
		if(DEBUG && options.name === DEBUG_THING) {
			console.log("Thing constructor: "+DEBUG_THING);
		}

		//extend the existing thing
		if(things[options.name]){
			//extend the existing data
			if(things[options.name].data && options.data)
				options.data = {...things[options.name].data, ...options.data};
			
			options = { ...things[options.name].originalOptions, ...options };
		}
		
		this.b4Make = options.beforeMake;
		this.afMake = options.afterMake;
		this.b4Render = options.beforeRender;
		this.originalOptions = options;  // stores what is load in by the files. NOT newPack data.

		//private attr used in Thing Explorer
		this._updatedProps = (options._updatedProps) ? options._updatedProps : []; 

		this._saveOptions(options);
	}

	// these things can be inherited from isa
	_saveOptions({ contains, namegen, isa,  data, icon, name, background, textColor, autoColor }){
		this.name = name;
		this.contains = contains;
		this.isa = (isa === name) ? undefined : isa;
		this.namegen = (namegen === name) ? undefined : namegen;
		this.data = data;
		this.icon = cleanIcon(icon);
		this.background = cleanColor(background, name);
		this.textColor = cleanColor(textColor);
		this.autoColor = autoColor;
	}

	setProperty(property, value){
		if((property === "isa" || property === "namegen") && value === this.name) 
			value = undefined;
		if(property === "icon")
			value = cleanIcon(value);
		if(property === "background")
			value = cleanColor(value, this.name);
		if(property === "textColor")
			value = cleanColor(value);
		
		this[property] = value;

		if(!this._updatedProps.includes(property)){
			this._updatedProps.push(property);
		}
	}

	//data cleanup
	save(){
		if(this.name !== BLANK_NAME) this.name = this.name.trim();
		
		try{ //JSON format
			this.namegen = JSON.parse(this.namegen);
		}catch(e){}
		try{ //JSON format
			this.data = JSON.parse(this.data);
		}catch(e){}
		if(this.contains){
			this.contains.forEach((c,i) =>{
				try{ //JSON format
					this.contains[i] = JSON.parse(c);
				}catch(e){}
			})
		}

		var updates = {};
		this._updatedProps.forEach((prop) => {
			if(valueIsUndefined(this[prop]) || this.originalOptions[prop] === this[prop]) 
				this[prop] = undefined;

			updates[prop] = this[prop];
		});
		this._updatedProps = [];
		return updates;
	}


	beforeMake(instance, thing){
		if(!thing) thing = this;

		//super
		var isa = this.getIsa();
		var result;
		if(isa) {
			result = isa.beforeMake(instance, thing);
			thing = (result && result.thing) ? result.thing : thing;
		}

		if(this.b4Make) {
			result  = this.b4Make.call(thing, instance, tableStore);
			thing = (result && result.thing) ? result.thing : thing;
		}

		return { isa, thing };
	}
	
	afterMake(instance, thing){
		if(!thing) thing = this;
		//super
		var isa = this.getIsa();
		if(isa) isa.afterMake(instance, thing);

		if(this.afMake) {
			this.afMake.call(thing, instance, tableStore);
		}
	}

	beforeRender(instance, thing) {
		if(!thing) thing = this;
		//super
		var isa = this.getIsa();
		if(isa) isa.beforeRender(instance, thing);

		if(this.b4Render) {
			this.b4Render.call(thing, instance, tableStore);
		}
	}

	isUnique(){
		if((/^[A-Z]/).test(this.name)){
			return true;
		}
		return false;
	}

	getName(){
		if(typeof this.namegen === "function"){
			return this.namegen();
		}

		if(this.namegen) 
			return tableStore.roll(this.namegen);

		if(this.isUnique && this.name)
			return this.name;

		var isa = this.getIsa();
		if(isa.namegen || !this.name) 
			return isa.getName();

		if(this.name) 
			return this.name;

		return "";
	}

	getIcon(){
		if(this.icon !== undefined)
			return tableStore.roll(this.icon);

		var isa = this.getIsa();
		if(isa) return isa.getIcon();

		return "";
	}

	getData(){
		var isa = this.getIsa();
		var data = (this.data) ? this.data : {};

		if(!isa)
			return {...data};
		
		if(isa)
			return {...isa.getData(), ...data};

		return {};
	}

	getBackground(){
		if(this.background)
			return tableStore.roll(this.background);

		var isa = this.getIsa();
		if(isa) return isa.getBackground();

		return "";
	}

	getTextColor(){
		if(this.textColor)
			return tableStore.roll(this.textColor);

		var isa = this.getIsa();
		if(isa) return isa.getTextColor();

		return "";
	}

	getContains(){
		if(this.contains && this.contains.length)
			return this.contains;

		var isa = this.getIsa();
		if(isa)
			return isa.getContains();
		return [];
	}

	getIsa(){
		if(!this.isa) return false;

		var isa = (this.isa.roll && this.isa.length) ? tableStore.roll(this.isa) : this.isa;

		if(typeof isa === "string"){
			if(thingStore.exists(isa))
				return thingStore.get(isa);
			else 
				return false;
		}
		else {
			if(DEBUG) console.error(this.name+" isa is not a string");
			return false;
		}
	}

	isItA(name){
		if(this.isa === name)
			return true;

		if(!this.isa)
			return false;

		return thingStore.get(this.isa).isItA(name);
	}
}

function checkIsa(isa, name){
	if(!thingStore.exists(isa))
		throw new Error("Cannot to set "+name+" isa to non-existent thing "+isa);
}

//fa-spin and gi-spin do the same thing, so clean them up
function cleanIcon(icon){
	const gi = / gi-spin /g;
	const fa = / fa-spin /g;
	const slow = " spin animated infinite ";

	if(typeof icon === "string"){
		return (" "+icon+" ").replace(gi,slow).replace(fa,slow).trim();
	}
	else if(icon && icon.map){
		return icon.map((i) => (" "+i+" ").replace(gi,slow).replace(fa,slow).trim())
	}
}

function cleanColor(color, name){
	if(!color) return color;

	if(typeof color === "string")
		return Styler.cleanColor(color,name);

	if(color.map)
		return color.map((c) => Styler.cleanColor(c,name))
}

//convenience for packs to access Thing functions;
Thing.prototype.thingStore = thingStore;

thingStore.add = function(options){
	if(options instanceof Array){
		options = {contains:[].concat(options)}
	}
	var addingNew = options.name && !thingStore.exists(options.name);

	//name cleanup
	if(options.name && options.name !== BLANK_NAME)
		options.name = options.name.trim();

	var thing = new Thing(options);

	if(thing.name){

		//add to the sorted names array
		var result = binaryFind(this.sortedThingNames, thing.name)
		if(!result.found) this.sortedThingNames.splice(result.index,0,thing.name);

		//add to the generic names array
		if(isGeneric(thing)){
			result = binaryFind(this.isaOptions, thing.name)
			if(!result.found) this.isaOptions.splice(result.index,0,thing.name);
		}

		things[thing.name] = thing;
		if(addingNew)
			doCallbacks()
	}

	return thing;
}

function doCallbacks(){
	Object.values(updateCallbacks).forEach((callback) => callback());
}

thingStore.bindListener = function(name, callback){
	updateCallbacks[name] = callback;
}
thingStore.unbindListener = function(name, callback){
	delete updateCallbacks[name];
}

thingStore.addAll = function(obj, isTemp){
	var errors = [];

	for(var name in obj){
		var options = obj[name];
		if(options === false){
			delete things[name];
			continue;
		}
		if(options instanceof Array){
			options = {contains: [...obj[name]] }
		}
		
		var thing = new Thing(Object.assign({name:""+name}, options));
		
		if(isTemp && things[name]){
			thing.originalOptions = things[name].originalOptions;
		}

		if(thing.name)
			things[thing.name] = thing;
	}

	// validation and error throwing
	try{
		Object.values(things).forEach((t) => {
			if(t.isa){
				if(t.isa.map) {
					t.isa.map((i) => checkIsa(i, t.name));
				}
				else checkIsa(t.isa, t.name);
			}
		});
	}catch(e){
		errors.push(e);
	}

	//sort
	this.sortedThingNames = Object.keys(things).sort(); 
	this.isaOptions = getGenericThingNames(this.sortedThingNames);
	doCallbacks();

	if(errors.length){
		throw errors;
	}
}

thingStore.filter = function(str){
	return Object.keys(things).filter((name) => name.includes(str) );
}

thingStore.exists = function(name){
	if(typeof name !== "string") return false;

	if(name.startsWith('.')) name = name.substring(1);
	return typeof things[new Contain(name).value] !== "undefined";
}

thingStore.get = function(name){
	if(!things[name]){
		throw new Error("could not find Thing named "+name);
	}
	return things[name];
}

thingStore.getThings = function(names){
	if(names){
		return names.map((name) => things[name]);
	}
	return things;
}

thingStore.rename = function(oldName, newName){
	if(things[newName]){
		throw new Error(newName+" is already a thing. Can't rename "+oldName);
	}
	if(!things[oldName]){
		return thingStore.add({name: newName});
	}

	newName = newName.trim();

	if (oldName !== newName) {
		thingStore.add({ ...this.get(oldName), name: newName});
		this.delete(oldName, true)
	}
	
	doCallbacks();

	return things[newName];
}

thingStore.delete = function(name, dontCallback){
	if(!things[name]) return;

	var oldIndex = binaryFind(this.sortedThingNames, name)
	this.sortedThingNames.splice(oldIndex.index,1);

	if(isGeneric(things[name])){
		oldIndex = binaryFind(this.isaOptions, name)
		this.isaOptions.splice(oldIndex.index,1);
	}

	delete things[name];

	if(!dontCallback){
		doCallbacks();
	}
}

thingStore.resetProperty = function(thing, property, stillUpdated){

	if(typeof thing === "string") thing = thingStore.get(thing);
	
	var val = thing.setProperty(property, thing.originalOptions[property]);

	if(!stillUpdated)
		thing._updatedProps.splice(thing._updatedProps.indexOf(property), 1);

	return val;
}

function isGeneric(thing){
	var u = thing.uniqueInstance;
	return !(/^[A-Z]/).test(thing.name) && u !== true && typeof u !== "number"
}

function getGenericThingNames(names){
	return names.filter((name) => isGeneric(things[name]))
}

export default thingStore;
export { BLANK_NAME };