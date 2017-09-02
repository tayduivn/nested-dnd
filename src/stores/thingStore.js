import tableStore from './tableStore.js';
import Styler from '../util/Styler.js';
import Contain from '../util/Contain.js'

import { binaryFind, clean } from '../util/util.js';

let things = {};
let thingStore = {};

thingStore.isaOptions = []; // generic options to select from a dropdown
thingStore.sortedThingNames = []; 

const BLANK_NAME = " ";

let updateCallbacks = {};
var DEBUG = false;
var DEBUG_THING = "universe";

class Thing{
	constructor(options){
		if(DEBUG && options.name === DEBUG_THING) {
			console.log("Thing constructor: "+DEBUG_THING);
		}
		
		//extend the existing thing
		if(things[options.name]){
			options = { ...things[options.name].originalOptions, ...options };
		}

		//set functions. These are not in saveOptions because we don't want to copy isa functions
		this.name = options.name;
		this.b4Make = options.beforeMake;
		this.afMake = options.afterMake;
		this.b4Render = options.beforeRender;
		this.isa = options.isa;
		this.originalOptions = options; // stores what is load in by the files. NOT newPack data.
		this._updatedProps = (options._updatedProps) ? options._updatedProps : []; //private attr used in Thing Explorer
		this._newPack = (options._newPack) ? options._newPack : {}; // the user-created new pack loaded by the pack editor
		this._beforeIsa = (options._beforeIsa) ? options._beforeIsa : {}; // after all packs (inc. newPack has loaded)
		this._areMe = (options._areMe) ? options._areMe : []; // things that have .isa set to me

		this._saveOptions(options);

		/*  do extend and set defaults */
		var isaProcessed = false;
		this.processIsa = function(newIsa, areMe){
			if(DEBUG && this.name === DEBUG_THING) {
				console.log("Thing.processIsa: "+DEBUG_THING);
			}

			if(areMe && !this._areMe.includes(areMe)) {
				this._areMe.push(areMe);
			}

			// need this if there is a newPack. Stores the state before any isa ever runs
			if(!isaProcessed){
				this._beforeIsa = {...clean(this)};
				delete this._beforeIsa.originalOptions;
				delete this._beforeIsa.processIsa;
				delete this._beforeIsa._updatedProps;
			}

			if(isaProcessed && !newIsa) return this;

			//clear previous isa data
			if(isaProcessed && newIsa){ 
				var resetOptions = {...this._beforeIsa, ...this._newPack};
				this._updatedProps.forEach((prop)=>resetOptions[prop] = this[prop]);
				this._saveOptions(resetOptions);
			}

			//recurse
			if(this.isa){
				var superThing = thingStore.get(this.isa).processIsa(false, this.name);
				this._saveOptions({...clean(superThing), ...clean(this)});
			}
			this._setDefaults(this);
			isaProcessed = true;
			return this;
		}
	}

	// these things can be inherited from isa
	_saveOptions({ contains, namegen, uniqueInstance, data, icon, name, background, textColor, autoColor }){
		this.contains = contains;
		this.namegen = namegen;
		this.uniqueInstance = uniqueInstance;
		this.data = data;
		this.icon = cleanIcon(icon);
		this.background = Styler.cleanColor(background, name, textColor);
		this.textColor = Styler.cleanColor(textColor);
		this.autoColor = autoColor;
	}

	// happens after proccess isa so parent isa's will overwrite these values
	_setDefaults({name, isa, namegen = false, contains = [], uniqueInstance, data = {}, autoColor = true }){
		this.isa = (isa === name) ? null : isa;
		this.namegen = (namegen === this.name) ? false : namegen;
		this.contains = contains;
		this.uniqueInstance = uniqueInstance;
		if(uniqueInstance === undefined && (/^[A-Z]/).test(name)){
			this.uniqueInstance = true;
		}
		this.data = data;
		this.autoColor = autoColor;
	}

	beforeMake(instance, thing){
		this.processIsa();

		if(!thing) thing = this;

		//super
		if(this.isa) {
			thing = things[this.isa].beforeMake(instance, thing);
		}

		if(this.b4Make) {
			thing = this.b4Make.call(thing, instance);
		}

		return thing;
	}
	
	afterMake(instance, thing){
		if(!thing) thing = this;
		//super
		if(this.isa) things[this.isa].afterMake(instance, thing);

		if(this.afMake) {
			this.afMake.call(thing, instance);
		}
	}

	beforeRender(instance, thing) {
		if(!thing) thing = this;
		//super
		if(this.isa) things[this.isa].beforeRender(instance, thing);

		if(this.b4Render) {
			this.b4Render.call(thing, instance);
		}
	}

	getName(){
		if(typeof this.namegen === "function"){
			return this.namegen();
		}
		
		if(this.namegen  instanceof Array && this.namegen[0] instanceof Array){
			var table = tableStore.add({rows: this.namegen, concatenate: true})
			return table.roll();
		}

		if(this.namegen)
			return tableStore.roll(this.namegen);

		return this.name;
	}

	getIcon(){
		if(!this.icon) return "";

		return tableStore.roll(this.icon);
	}
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

	var thing = new Thing(options).processIsa();

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
			thing._newPack = options; // what was set in the pack
			thing.originalOptions = things[name].originalOptions;
		}

		if(thing.name)
			things[thing.name] = thing;
	}

	//sort
	this.sortedThingNames = Object.keys(things).sort(); 
	this.isaOptions = getGenericThingNames(this.sortedThingNames);
	doCallbacks();
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

thingStore.rename = function(oldName,newName){
	if(things[newName]){
		throw new Error(newName+" is already a thing. Can't rename "+oldName);
	}
	if(!things[oldName]){
		return thingStore.add({name: newName});
	}

	newName = newName.trim();

	if (oldName !== newName) {
		var thing = thingStore.add({ ...this.get(oldName), name: newName});
		thing._areMe.forEach((t) => things[t].isa = newName);

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

thingStore.resetProperty = function(thing, property){
	thing[property] = undefined;

	if(typeof thing === "string") thing = thingStore.get(thing);
	
	thing[property] = thing.originalOptions[property];
	thing._beforeIsa[property] = thing.originalOptions[property];

	//process isa just for this field
	if(thing.isa && property !== "isa" && property !== "name"){
		thing[property] = findAncestorWithProperty.call(thing,property);
	}
	
	// if this property is the same as the current new Pack, it hasn't been updated
	if(thing._newPack[property]){
		if(thing[property] === thing._newPack[property])
			thing._updatedProps.splice(thing._updatedProps.indexOf(property),1);
		else if(!thing._updatedProps.includes(property)){
			thing._updatedProps.push(property);
		}
	}
	// if it's not in the new pack, but it's the same as the original, it hasn't been updated
	else if(thing[property] === thing.originalOptions[property]){
		thing._updatedProps.splice(thing._updatedProps.indexOf(property),1);
	}else if(!thing._updatedProps.includes(property)){
		thing._updatedProps.push(property);
	}

	thing._setDefaults(thing); 
	return thing[property];

	function findAncestorWithProperty(property){
		if(this[property] !== undefined) return this[property];

		if(this.isa) return findAncestorWithProperty.call(thingStore.get(this.isa), property);

		return;
	}
}

thingStore.processAll = function(nameArr){
	if(DEBUG) console.log("thingStore.processAll "+((nameArr) ? nameArr.length : Object.keys(things).length) )

	if(nameArr){
		nameArr.forEach((name) => { if(things[name]) things[name].processIsa(true) })
	}
	else{
		for(var name in things){
			things[name].processIsa(true);
		}
	}
}

function isGeneric(thing){
	var u = thing.uniqueInstance;
	return !(/^[A-Z]/).test(thing.name) && u !== true && typeof u !== "number"
}

function getGenericThingNames(names){
	return names.filter((name) => isGeneric(things[name]))
}

export default thingStore;