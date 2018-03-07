import {choose,weightedChoose,weightedDiceChoose} from '../util/util.js'

let tables = {};
let tableStore = {};

class Table {
	constructor(options){
		this.rows = options.rows;
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

tableStore.isTableID = function(str){
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
	else if(typeof table === "string" && this.isTableID(table)){
		// is an alias for another table
		return this.get(table);
	}

	return table;
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

export default tableStore;