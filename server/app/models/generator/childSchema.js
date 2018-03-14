const Schema = require("mongoose").Schema;
const async = require("async");
const Maker = require('./make');

var childSchema = Schema({
	type: {
		$type: String, // string, generator, table, embed
		require: true,
		default: "string"
	}, 
	value: { 
		$type: Schema.Types.Mixed
	},
	amount: {
		min: {
			$type: Number,
			min: 1
		},
		max: { 
			$type: Number,
			min: 1
		} //max will be empty when it's always the samae
	},
	chance: {
		$type: Number,
		min: 1,
		max: 100
	}
}, { typeKey: '$type', _id: false });

childSchema.virtual('isIncluded').get(function(){
	if(!this.chance || this.change >= 100) 
		return true;
	return Math.random()*100<=this.chance;
});

childSchema.virtual('makeAmount').get(function(){
	if(!this.amount || !this.amount.min)
		return 1;
	if(this.amount.max)
		return Math.rand(this.amount.min, this.amount.max);
	return this.amount.min;
});


/**
 * Generate a child
 */
childSchema.methods.make = function(pack, generations){
	Maker.make(child, pack, generations);
}

Math.rand = function(min,max){// eslint-disable-line
	//Return a number between min and max, included.
	return parseFloat(Math.floor(Math.random()*(max-min+1)))+parseFloat(min);
}

module.exports = childSchema;