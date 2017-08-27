import tableStore from './tableStore.js';
import Styler from '../util/Styler.js';
import Contain from '../util/Contain.js'

let things = {};
let thingStore = {};

class Thing{
	constructor(options){
		//functions
		this.b4Make = options.beforeMake;
		this.afMake = options.afterMake;
		this.b4Render = options.beforeRender;

		if(things[options.name]){
			options = Object.assign({}, things[options.name], options );
		}

		//data clean
		if(options.background) options.background = options.background.toLowerCase();
		if(options.textColor) options.textColor = options.textColor.toLowerCase();

		saveOptions(this,options);
		
		this.cssClass;

		//save
		if(this.name)
			things[""+this.name] = this;

		function saveOptions(_t, options){
			_t.name = options.name,
			_t.isa = options.isa;
			_t.contains = options.contains;
			_t.namegen = options.namegen;
			_t.uniqueInstance = options.uniqueInstance;
			_t.data = options.data;
			_t.icon = options.icon;
			_t.background = options.background;
			_t.textColor = options.textColor;
			_t.autoColor = options.autoColor;
			_t.originalOptions = options;
		}

		/*  do extend and set defaults */
		var isaProcessed = false;
		this.processIsa = function(){
			if(isaProcessed) return;

			if(this.isa){

				//whoops -- is itself
				if(this.isa == this.name){
					this.isa = null;
					return;
				}

				var superThing = thingStore.get(this.isa);
				superThing.processIsa();

				saveOptions(this, Object.assign({}, clean(superThing), clean(this) ));
			}

			/* TODO: temporary */
			if((/^[A-Z]/).test(this.name) && this.uniqueInstance !== false && !this.uniqueInstance){
				this.uniqueInstance = true;
			}
			if(this.autoColor !== false && !this.autoColor) this.autoColor = true;
			if(!this.contains) this.contains = [];
			if(!this.data) this.data = {};
			if(!this.icon) this.icon = "empty";
			if(this.namegen === "" || this.namegen == this.name) this.namegen = false;
			this.cssClass = Styler.getClass(this);
			Styler.addThing(this);

			isaProcessed = true;

			return this;
		}

		function clean(obj) {
			Object.assign({},obj);
		  for (var propName in obj) { 
		    if (obj[propName] === undefined) {
		      delete obj[propName];
		    }
		  }
		  return obj;
		}
	}

	beforeMake(instance, thing){
		this.processIsa();

		if(!thing) thing = this;

		//super
		if(this.isa) things[this.isa].beforeMake(instance, thing);

		if(this.b4Make) {
			this.b4Make.call(thing, instance);
		}
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
		if(this.icon && this.icon.roll) 
			return this.icon.roll();
		return this.icon;
	}
}

//convenience for packs to access Thing functions;
Thing.prototype.thingStore = thingStore;

thingStore.add = function(options){
	if(options instanceof Array){
		options = {contains:[].concat(options)}
	}		
	return new Thing(options).processIsa();
}

thingStore.addAll = function(obj){
	for(var name in obj){
		var thing = obj[name];
		if(thing instanceof Array){
			thing = {contains:[].concat(thing)}
		}
		thing = new Thing(Object.assign({name:""+name}, thing));
	}
}

thingStore.filter = function(str){
	return Object.keys(things).filter((name) => name.includes(str) );
}

thingStore.exists = function(name){
	return typeof things[new Contain(name).value] !== "undefined";
}

thingStore.get = function(name){
	if(!things[name]){
		throw new Error("could not find Thing named "+name);
	}
	return things[name];
}

thingStore.getThings = function(){
	return things;
}

export default thingStore;