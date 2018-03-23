const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const Maker = require('./generator/make');
const Util = require('./utils');

var rowSchema = Schema({
	type: String,
	value: Schema.Types.Mixed,
	weight: Number
}, { typeKey: '$type'})

var tableSchema = Schema({
	pack_id: {
		type: Schema.Types.ObjectId,
		ref: 'Pack',
		required: true
	},
	title: String,
	rows: {
		type:[rowSchema]
	},
	concat: Boolean,
	rowWeights: Boolean,
	tableWeight: Number
});

/**
 * Cleans rows to be row schema if they are strings
 */
tableSchema.path('rows').set((arr)=>{
	arr = arr.map((row)=>{
		if(typeof row === 'string'){
			return { value: row }
		}
		return row;
	})
	return arr;
});

//returns a Promise<String>
tableSchema.methods.roll = function(){

	if(this.concat){
		return this.concatenate();
	}

	var row;
	if(this.rowWeights)
		row = weightedDiceChoose(this.rows);
	else if(this.tableWeight)
		row = weightedChoose(this.rows, this.tableWeight);
	else
		row = choose(this.rows);

	if(typeof row === 'string')
		return row;

	return Maker.makeMixedThing(row, this.model('Table'));
}

tableSchema.methods.concatenate = async function(){
	var result = "";
	var Table = this.model('Table');

	//for loop always results in a string
	for(var i = 0; i < this.rows.length; i++){
		var rowResult = await Maker.makeMixedThing(this.rows[i], Table);
		result += rowResult;
	};

	return result;
}

function choose(arr){
	//Returns an element from an array at random.
	var result = arr[Math.floor(Math.random()*arr.length)];

	return result;
}

function weightedChoose(arr,weightChoose){
	//Returns an element from an array at random according to a weight.
	//A weight of 2 means the first element will be picked roughly twice as often as the second; a weight of 0.5 means half as often. A weight of 1 gives a flat, even distribution.
	if (weightChoose<=0 || weightChoose===undefined) weightChoose=1;
	var result = arr[Math.floor(Math.pow(Math.random(),weightChoose)*arr.length)];

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
	var dRoll = Util.rand(1,dSize);
	
	for(i = 0; i < percentages.length; i++){
		threshold+= percentages[i];
		if(dRoll <= threshold){
			return arr[i];
		}
	}
}

module.exports = mongoose.model('Table', tableSchema);