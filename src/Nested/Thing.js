import Table from './Table.js';
import Styler from './Styler.js';

let things = {}

class Thing{
	constructor(options){

		//overwrite existing thing
		if(things[options.name]){
			Object.assign(this,things[options.name]);
		}

		this.name = options.name || this.name;
		this.isa = options.isa || this.isa;
		this.contains = options.contains || this.contains ||  [];
		this.extend = options.extend || this.extend || false; //if true, will append this.contains to this.isa.contains
		this.namegen = options.namegen || this.namegen;
		this.uniqueInstance = options.uniqueInstance || this.uniqueInstance || false;
		this.data = options.data || this.data || {};
		this.icon = options.icon || this.icon || "empty";
		this.background = options.background || this.background;
		this.textColor = options.textColor || this.textColor;
		this.autoColor = options.autoColor || this.autoColor || true;

		//not an option
		this.cssClass = Styler.getClass(this);

		//save
		if(this.name)
			things[""+this.name] = this;
	}

	getName(){
		if(this.isa && !this.name && !this.namegen)
			return parse(things[this.isa]);
		else
			return parse(this);
	
		function parse(thing){
			if(thing.namegen === "" || thing.namegen == thing.name)
				thing.namegen = false;

			if(typeof thing.namegen === "function"){
				return thing.namegen();
			}
			
			if(thing.namegen  instanceof Array && thing.namegen[0] instanceof Array){
				var table = new Table({rows: thing.namegen, concatenate: true})
				return table.roll();
			}

			if(thing.namegen)
				return Table.roll(thing.namegen);

			return thing.name;
		}
	}//getName

	getIcon(name){
		if(!name) name = this.getName();

		var icon = "";
		if(this.isa && !this.icon)
			icon = things[this.isa].icon;
		else
			icon = this.icon;

		if(icon.roll) 
			icon = icon.roll();

		return icon;
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