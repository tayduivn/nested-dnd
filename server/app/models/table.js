const mongoose = require('mongoose')
const Schema = mongoose.Schema;

var tableSchema = Schema({
	_pack: {
		type: Schema.Types.ObjectId,
		ref: 'Pack',
		required: true
	},
	title: String,
	rows: {
		type:[Schema.Types.Mixed],
		validate: function(v){
			return v.length > 0;
		}
	},
	doConcat: {
		type: Boolean,
		default: false
	},
	hasWeightedRows: {
		type: Boolean,
		default: false
	},
	tableWeight: Number
});

//returns a String
tableSchema.methods.roll = function(){
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

	return roll(result);
}

tableSchema.methods.concat = function(){
	var result = "";
	var part;

	//for loop always results in a string
	for(var i in this.rows){ // arguments is not an Array, so this works
		part = this.rows[i];
		if(part === Array.prototype.roll) continue;
		
		if(part.type === "table")
			part = new Table(result);

		result+= roll(part);
	}

	return roll(result);
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

function roll(obj){
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

	if(obj.type === "tableid"){
		// TODO get from db
	}

	if(obj.roll) obj = obj.roll();

	return obj;
}

module.exports = mongoose.model('Table', tableSchema);