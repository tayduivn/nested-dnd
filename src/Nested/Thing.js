import Instance from './Instance.js';
import Table from './Table.js';
import Styler from './Styler.js';

let things = {}

class Thing{
	constructor(options){

		//functions
		this.b4Make = options.beforeMake;
		this.afMake = options.afterMake;
		this.b4Render = options.beforeRender;

		options = Object.assign({}, options, (
			//overwrite existing thing
			things[options.name]) ? clean(things[options.name]) : {} );
		saveOptions(this,options);

		//data clean
		if(this.background) this.background = this.background.toLowerCase();
		if(this.textColor) this.textColor = this.textColor.toLowerCase();
		this.cssClass;
		

		//save
		if(this.name)
			things[""+this.name] = this;

		function saveOptions(_t, options){
			_t.name = options.name,
			_t.isa = options.isa;
			_t.doExtend = options.doExtend;
			_t.contains = options.contains;
			_t.namegen = options.namegen;
			_t.uniqueInstance = options.uniqueInstance;
			_t.data = options.data;
			_t.icon = options.icon;
			_t.background = options.background;
			_t.textColor = options.textColor;
			_t.autoColor = options.autoColor;
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

				var superThing = Thing.get(this.isa);
				superThing.processIsa();

				saveOptions(this, Object.assign({}, clean(superThing), clean(this) ));

				if(this.doExtend){
					this.contains = superThing.contains.concat(this.contains);
				}
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
		if(!thing) thing = this;
		//super
		if(this.isa) things[this.isa].beforeMake(instance, thing);

		if(this.b4Make) {
			this.b4Make.call(thing, instance, Instance, Thing);
		}
	}

	afterMake(instance, thing){
		if(!thing) thing = this;
		//super
		if(this.isa) things[this.isa].afterMake(instance, thing);

		if(this.afMake) {
			this.afMake.call(thing, instance, Instance, Thing);
		}
	}

	beforeRender(instance, thing) {
		if(!thing) thing = this;
		//super
		if(this.isa) things[this.isa].beforeRender(instance, thing);

		if(this.b4Render) {
			this.b4Render.call(thing, instance, Instance, Thing);
		}
	}

	getName(){
		if(typeof this.namegen === "function"){
			return this.namegen();
		}
		
		if(this.namegen  instanceof Array && this.namegen[0] instanceof Array){
			var table = new Table({rows: this.namegen, concatenate: true})
			return table.roll();
		}

		if(this.namegen)
			return Table.roll(this.namegen);

		return this.name;
	}

	getIcon(){
		if(this.icon && this.icon.roll) 
			return this.icon.roll();
		return this.icon;
	}
}

Thing.add = function(obj){
	if(obj instanceof Array){
		obj = {contains:[].concat(obj)}
	}
	return new Thing(obj).processIsa();
}

Thing.addAll = function(obj){
	for(var name in obj){
		var thing = obj[name];
		if(thing instanceof Array){
			thing = {contains:[].concat(thing)}
		}
		thing = new Thing(Object.assign({name:""+name}, thing));
	}

	for(var name in things){
		things[name].processIsa();
	}
}

Thing.exists = function(name){
	return typeof things[name] !== "undefined";
}

Thing.get = function(name){
	if(!things[name]){
		throw new Error("could not find Thing named "+name);
	}
	return things[name];
}

Thing.checkForIcons = function(things){
	for(var thingName in things){
		var t = things[thingName];
		var name = t.getName()
		if(t.getIcon(name) !== "empty")
			continue;

		var results = getDefinedCss(""+t.name.replace("medieval ","").replace("ancient ","").replace("future ",""))
		/*if(!results.length){
			results = getDefinedCss("fa-"+t.name.replace("medieval ","").replace("ancient ","").replace("future ",""))
		}*/
		if(results.length){
			console.log("FOUND ICON \t\t thing: "+t.name+" || options: "+results);
		}
		/*else{
			console.log("NEED ICON \t\t thing: "+t.name);
		}*/
	}
}

function getDefinedCss(s){
	if(!document.styleSheets) return '';
	if(typeof s === 'string') s= RegExp('\\b'+s+'\\b','i'); 

	var A, S, DS= document.styleSheets, n= DS.length, SA= [];
	while(n){
		S= DS[--n];
		A= (S.rules)? S.rules: S.cssRules;
		for(var i= 0, tem, L= A.length; i<L; i++){
			tem= A[i].selectorText? [A[i].selectorText,A[i].style.cssText] : [A[i]+''];
			if(s.test(tem[0])){
				SA[SA.length]= tem[0].split("::")[0];
			}
		}
	}
	return SA.join('\t\t|\t\t');
}

export default Thing;