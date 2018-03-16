import {choose,weightedChoose,weightedDiceChoose} from '../util/util.js'

let tables = {};
let tableStore = {};

class Table {
	constructor(options){

		this.rows = options.rows.map(tableStore.makeTable);

		this.concatenate = options.concatenate; // boolean
		this.hasWeightedRows = options.hasWeightedRows; // boolean
		this.tableWeight = options.tableWeight; // numeric or false -- weightedChoose()
	}

	//returns a String
	roll(){
		if(this.concatenate)
			return this.concat();

		var result;
		var rows = this.rows.slice(); //copy array so can use again and get different result

		if(this.hasWeightedRows){
			result = weightedDiceChoose(rows);
		}
		else if(this.tableWeight){
			result = weightedChoose(rows, this.tableWeight);
		}else{
			result = choose(rows);
		}

		return tableStore.roll(result);
	}

	concat(){
		var result = "";
		var part;

		//for loop always results in a string
		for(var i in this.rows){ // arguments is not an Array, so this works
			part = this.rows[i];
			if(part === Array.prototype.roll) continue;
			
			if(part.type === "table")
				part = new Table(result);

			result+= tableStore.roll(part);
		}

		return tableStore.roll(result);
	}
};

tableStore.makeTable = function(r){
	if(r instanceof Table || !tableStore.isRollable(r)) 
		return r;

	if(r.constructor === ({}).constructor && r.rows)
		return new Table(r);
	if(r instanceof Array)
		return new Table({rows: r})

	if(typeof r !== "string"){
		console.error("WHAT IS THIS");
		return r;
	}

	var parts = r.split("|")
	if(parts.length !== 1)
		return new Table({rows: parts, concatenate: true});

	//if(tableStore.isTableID(r))
	//	return tableStore.get(r);

	//plain string
	return r;
}

tableStore.roll = function(obj){
	if(obj === undefined) return obj;
	
	if(obj.constructor === ({}).constructor && obj.rows){
		obj = new Table(obj);
	}

	if(obj.roll){
		obj = obj.roll();
	}

	if(typeof obj !== "string"){
		return obj;
	}

	var parts = obj.split("|")
	if(parts.length !== 1){
		obj = new Table({rows: parts, concatenate: true}).roll();
	}else
		obj = parts[0];

	if(this.isTableID(obj)){
		obj = this.get(obj);
	}

	if(obj.roll) obj = obj.roll();

	return obj;

}

tableStore.isRollable = function(obj){
	var result = tableStore.roll(obj);
	return obj !== result;
}

tableStore.cleanTableID = function(str){
	return str.trim().substring(1, str.length-1);
} 

tableStore.isTableID = function(str){
	if(!str || typeof str !== "string") return false;
	str = str.trim();
	return str.charAt(0) === "*" && str.charAt(str.length-1) === "*"
		&& typeof tables[str.substring(1, str.length-1)] !== "undefined";
}

tableStore.exists = function(str){
	return typeof tables[str] !== "undefined";
}

tableStore.get = function(str){
	str = str.trim();
	if(str.charAt(0) === "*" && str.charAt(str.length-1))
		str = str.substring(1, str.length-1);

	var table = tables[str];
	if(!table){
		console.error("Table with name "+str+" could not be found")
		return [];
	}

	if(table.constructor === ({}).constructor){
		table = tables[str] = new Table(tables[str]);
	}
	if(table instanceof Array){
		table = tables[str] = new Table({ rows: tables[str] })
	}
	else if(typeof table === "string" && this.isTableID(table)){
		// is an alias for another table
		return this.get(table);
	}

	return table;
}

tableStore.getAll = function(){
	return tables;
}

tableStore.add = function(options){
	if(!(options.rows instanceof Array)){
		throw new Error("rows must be Array");
	}
	return new Table(options);
}

tableStore.addAll = function(newTables){
	Object.assign(tables, newTables);
}

Array.prototype.roll = function(){ // eslint-disable-line
	var result = choose(this);

	//termination condition: no roll function;
	return tableStore.roll(result);
}

Array.prototype.equals = function (array) { // eslint-disable-line
		// if the other array is a falsy value, return
		if (!array)
				return false;

		// compare lengths - can save a lot of time 
		if (this.length !== array.length)
				return false;

		for (var i = 0, l=this.length; i < l; i++) {
				// Check if we have nested arrays
				if (this[i] instanceof Array && array[i] instanceof Array) {
						// recurse into the nested arrays
						if (!this[i].equals(array[i]))
								return false;       
				}           
				else if (this[i] !== array[i]) { 
						// Warning - two different object instances will never be equal: {x:20} != {x:20}
						return false;   
				}           
		}       
		return true;
}

export default tableStore;
export { Table };