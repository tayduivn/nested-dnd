const mongoose = require('mongoose')
const Schema = mongoose.Schema;
const fng = require('fantasy-names');

const Maker = require('./generator/make');
const Util = require('./utils');
const sourceSchema = require('./source');
const validateMixedThing = require('./generator/styleSchema').validateMixedThing

var rowSchema = Schema({
	type: {
		$type: String,
		enum: ['string','generator','table','embed','table_id','data','dice'],
		default: 'string'
	},
	value: Schema.Types.Mixed,
	weight: Number
}, { typeKey: '$type', _id: false})

var tableSchema = Schema({
	user: {
		type: Schema.Types.ObjectId,
		ref: 'User'
	},
	pack: { //pack that this table is contained within
		type: Schema.Types.ObjectId,
		ref: 'Pack'
	},
	title: String,
	desc: String,
	returns: {
		type: String,
		enum: ['generator','text','fng'],
		default: 'text'
	},
	rows: {
		type: [rowSchema],
		set: input => input.map((row)=>{
			return (typeof row === 'string') ? {value:row} : row;
		})
	},
	concat: Boolean,
	rowWeights: Boolean,
	tableWeight: Number,
	public: {
		type: Boolean,
		default: false
	},
	source: sourceSchema
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
tableSchema.methods.roll = async function(data){

	if(this.returns === 'fng'){
		try{
			var result = fng(this.rows[0] && this.rows[0].value, this.rows[1] && this.rows[1].value, 
				1, // quantity
				(this.rows[2] !== undefined && this.rows[2] !== null && !isNaN(this.rows[2].value) && this.rows[2].value) || undefined )[0];
			if(this.rows[3] && this.rows[3].value){
				return Util.toUpper(result);
			}
			return result;
		}catch(e){
			return null;
		}
	}

	if(this.concat){
		return this.concatenate(data);
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

	return await Maker.makeMixedThing(row, this.model('Table'), data);
}

tableSchema.methods.concatenate = async function(data){
	var result = "";
	var Table = this.model('Table');

	//for loop always results in a string
	for(var i = 0; i < this.rows.length; i++){
		var rowResult = await Maker.makeMixedThing(this.rows[i], Table, data);
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
module.exports.rowSchema = rowSchema;