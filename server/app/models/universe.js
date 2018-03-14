const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const generatorSchema = require('./generator.js').generatorSchema;

var universeSchema = Schema({
	_user: {
		type: Schema.Types.ObjectId,
		ref: 'User',
		required: true
	},

	// where we store all the custom stuff. Depenedecies of this pack are the packs added to this universe, etc.
	// This starts as the pack we init the universe from, but once we make changes, a dummy pack will be created that will store all our custom universe stuff
	_pack: Schema.Types.ObjectId, 

	instances: [

	]

});


module.exports = mongoose.model('Universe', universeSchema);