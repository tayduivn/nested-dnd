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
		//if true, will append this.contains to this.isa.contains
		this.extend = (typeof options.extend !== "undefined") ? options.extend 
			: (typeof this.extend !== "undefined") ? this.extend : false;
		this.namegen = options.namegen || this.namegen;
		this.uniqueInstance = (typeof options.uniqueInstance !== "undefined") ? options.uniqueInstance 
			: (typeof this.uniqueInstance !== "undefined") ? this.uniqueInstance : false;
		this.data = options.data || this.data || {};
		this.icon = options.icon || this.icon || "empty";
		this.background = options.background || this.background;
		this.textColor = options.textColor || this.textColor;
		this.autoColor = (typeof options.autoColor !== "undefined") ? options.autoColor
			: (typeof this.autoColor !== "undefined") ? this.autoColor : true;

		
		if(this.background) this.background = this.background.toLowerCase();
		if(this.textColor) this.textColor = this.textColor.toLowerCase();
		this.cssClass = Styler.getClass(this);

		//save
		if(this.name)
			things[""+this.name] = this;
	}

	getName(){
		var name;
		if(this.isa && !this.namegen)
			name = parse(things[this.isa],true);
		
		if(!name)
			return parse(this);
		else
			return name;
	
		function parse(thing, isSuper){
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

			return (isSuper) ? false : thing.name;
		}
	}//getName

	getIcon(name){
		if(!name) name = this.getName();

		var icon = "";
		if(this.isa){
			var superthing = things[this.isa];

			if(!this.background){
				this.background = superthing.background;
			}
			if(!this.textColor)
				this.textColor = superthing.textColor;
			if(this.icon == "empty")
				icon = things[this.isa].icon;

			this.cssClass = Styler.getClass(this);
		}
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