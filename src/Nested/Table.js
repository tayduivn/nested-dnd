let tables = {};

class Table {
	constructor(options){
		if(!(options.rows instanceof Array)){
			throw new Error("rows must be Array");
		}

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

		return Table.roll(result);
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

			result+= Table.roll(part);
		}

		return Table.roll(result);
	}
};

Table.roll = function(obj){
	if(obj.roll){
		return obj.roll();
	}

	if(typeof obj !== "string"){
		throw  new Error("Expecting string");
	}

	var parts = obj.split("|")
	if(parts.length !== 1){
		return new Table({rows: parts, concatenate: true}).roll();
	}
	obj = parts[0];

	if(Table.isTableID(obj)){
		return Table.getTable(obj).roll();
	}

	return obj;
}

Table.isTableID = function(str){
	str = str.trim();
	return str.charAt(0) === "*" && str.charAt(str.length-1) === "*"
		&& typeof tables[str.substring(1, str.length-1)] !== "undefined";
}

Table.getTable = function(str){
	str = str.trim();
	if(str.charAt(0) === "*" && str.charAt(str.length-1))
		str = str.substring(1, str.length-1);

	var table = tables[str];
	if(table.constructor === ({}).constructor){
		table = tables[str] = new Table(tables[str]);
	}
	else if(typeof table == "string" && Table.isTableID(table)){
		// is an alias for another table
		return Table.getTable(table);
	}

	if(!table.roll){
		throw new Error("Table cannot be rolled");
	}

	return table;
}

Table.addTables = function(newTables){
	Object.assign(tables, newTables);
}

Math.rand = function(min,max){// eslint-disable-line
	//Return a number between min and max, included.
	return parseFloat(Math.floor(Math.random()*(max-min+1)))+parseFloat(min);
}

function choose(arr){
	//Returns an element from an array at random.
	var result = arr[Math.floor(Math.random()*arr.length)];

	if(result.value)
		result = result.value;
	return result;
}

function weightedChoose(arr,weightChoose){
	//Returns an element from an array at random according to a weight.
	//A weight of 2 means the first element will be picked roughly twice as often as the second; a weight of 0.5 means half as often. A weight of 1 gives a flat, even distribution.
	if (weightChoose<=0 || weightChoose===undefined) weightChoose=1;
	var result = arr[Math.floor(Math.pow(Math.random(),weightChoose)*arr.length)];
	
	if(result.value)
		result = result.value;
	return result;
}

function weightedDiceChoose(arr){
	if(!(arr instanceof Array)){
		throw  new Error("arr must be instanceof Array");
	}

	var dSize = 0;
	var percentages = [];
	var value, weight;
	var row;

	arr = arr.slice();

	//sum weights
	for(var i = 0; i < arr.length; i++){
		row = arr[i];
		if(row.weight){
			value = row.value;
			weight = row.weight;
		}else if(typeof row === "string"){
			var parts = row.split(",");
			value = parts[0];
			weight = (parts[1]) ? parseInt(parts[1],10) : 1;
		}else{
			value = row;
			weight = 1;
		}

		dSize+= weight;
		percentages.push(weight);
		arr[i] = value;
	}
	var threshold = 0;
	var dRoll = Math.rand(1,dSize);
	
	for(i = 0; i < percentages.length; i++){
		threshold+= percentages[i];
		if(dRoll <= threshold){
			return arr[i];
		}
	}
}

Array.prototype.roll = function(){ // eslint-disable-line
	var result = choose(this);

	//termination condition: no roll function;
	return Table.roll(result);
}

export default Table;