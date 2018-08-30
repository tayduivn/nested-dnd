
var Maintainer = {

	/**
	 * Get all of the isas of children that are of type "generator", even in embedded documents
	 * @param  {Object[]} arr     children following childSchema
	 * @return {string[]}         isa
	 */
	getGeneratorChildren: function(arr){
		if(!arr) return [];
		var isas = [];

		arr.forEach(({type, value = ''})=>{
			if(type === "generator"){ //termination condition
				isas.push(value.toString());
				return;
			}

			// recurse
			isas = isas.concat(this.getGeneratorChildren(value.in));
		});

		return isas;
	},

	/**
	 * Renames isas of children that are of type "generator", even in embedded documents
	 * @param  {Generator} node    the generator to rename, or the child node we're in currently
	 * @param  {string} isaOld previous name of the generator
	 * @param  {string} isaNew new name of the generator
	 * @return {boolean|Object}         false or the modified generator
	 */
	renameChildren: function(node, isaOld, isaNew){
		if(!node || !node.in) return false;
		var changed = false;

		node.in.forEach((child, i)=>{
			//termination condition
			if(child.type === "generator" && child.value === isaOld){
				child.value = isaNew;
				changed = true;
			}
			// recurse
			else if(child.type === "embed" && child.value.in){
				var newChild = this.renameChildren(child.value, isaOld, isaNew);
				if(newChild) {
					changed = true;
					node.in[i].value = newChild;
				}
			}
		});

		// ------- return
		if(node._id){ // is the parent generator
			if(changed){
				node.markModified('in');
				return node;
			}
			return false;
		}
		else return (changed) ? node : false;
	},

	/**
	 * Insert a new generator into a pack
	 * @param  {Object}   data      the data of the new generator to insert
	 * @param  {Pack}   pack      Pack
	 * @param  {BuiltPack}   builtpack BuiltPack
	 * @return {Promise<Generator>}             the inserted generator
	 * @async
	 */
	insertNew: async function(data, pack, builtpack){

		if(!data || !pack || !builtpack)
			return;

		//validate isa
		if(builtpack.getGen(data.isa)){
			var e = new Error(data.isa+" generator already exists in pack "+pack._id);
			e.status = 412;
			throw e;
		}

		//validate extends
		if(data.extends && !builtpack.getGen(data.extends)){
			var e = new Error(data.extends+" extends generator doesn't exist in pack "+pack._id);
			e.status = 412;
			throw e;
		}

		//validate in
		if(data.in){
			var isas = this.getGeneratorChildren(data.in);

			for(var i = 0; i < isas.length; i++){
				if(!builtpack.getGen(isas[i]) && isas[i] !== data.isa){
					var e = new ReferenceError("Could not find child generator that is a "+isas[i])
					e.status = 412;
					throw e;
				}
			}
		}

		// put pack id
		data.pack = pack._id;

		var gen = await pack.model('Generator').create(data)

		//add to builtpack
		await builtpack.rebuildGenerator(gen.isa, pack)
		await builtpack.save();

		return { unbuilt: gen, built: builtpack.getGen(gen.isa) };
	},

	/**
	 * Removes a generator from the build after it was deleted
	 * @return {BuiltPack} the modified builtpack
	 * @this {Generator}
	 */
	cleanAfterRemove: async function(){
		var builtpack = await this.model('BuiltPack').findById(this.pack).exec();

		// clean up from build pack
		delete builtpack.generators[this.isa];
		builtpack.markModified('generators.'+this.isa);
		builtpack = await builtpack.save();

		return builtpack;
	},

	/**
	 * Handles changing the "isa" field of a generator, updating all the references to it
	 * @param  {Generator} generator the generator that has been saved with the latest name
	 * @param  {Pack} pack      the pack that the generator is in
	 * @param  {string} isaOld   the older name of the generator
	 * @async
	 */
	rename: async function(generator, pack, isaOld, builtpack){
		if(!generator || !pack || !isaOld) return;
		if(builtpack && !builtpack.markModified){
			throw new Error('builtpack argument is invalid format '+builtpack);
		}

		var isaNew = generator.isa;
		var Generator = generator.model('Generator');
		var BuiltPack = generator.model('BuiltPack');

		console.log('Generator.find rename');
		let result = await Promise.all([
			// find generators in this pack that contain in or extend with isaOld
			(builtpack && builtpack.RAW_GENS) || Generator.find({ pack: pack._id }).exec(),
			// set seed ----------------------------
			pack.renameSeed(isaOld, isaNew) 
		]);
		var gens = result[0];
		
		//move in builtpack
		if(builtpack){
			builtpack.RAW_GENS = gens;
			if(builtpack.generators[isaOld])
				delete builtpack.generators[isaOld];
			builtpack.markModified('generators.'+isaOld)
			builtpack.pushGenerator(generator);
		}
		

		if(!gens || !gens.length) {
			if(builtpack) builtpack.save();
			return;
		}
		
		gens.forEach((gen)=>{
			gen.pack = pack._id;
			renameWithinGen(gen, builtpack, isaOld, isaNew);
		});

		// push in and extends changes to buildpack. no need to rebuild
		if(builtpack) 
			await builtpack.save();
	}
}

/**
 * Renaming all references to this generator within another generator
 * @param  {[type]} gen       [description]
 * @param  {[type]} builtpack [description]
 * @return {[type]}           [description]
 */
function renameWithinGen(gen, builtpack, isaOld, isaNew){
	var changed = false;
	var newGen = Maintainer.renameChildren(gen, isaOld, isaNew);
	var builtGen = (builtpack) ? builtpack.getGen(gen.isa) : false;

	if(builtpack && !builtGen){
		throw new Error("Could not find build for "+gen.isa+" in pack "+gen.pack);
	}

	if(newGen){
		changed = true;
		gen = newGen;
		if(builtpack){
			builtGen.in = newGen.in;
			builtpack.markModified('generators.'+newGen.isa+".in");
		}
	}

	// just rename extends -- the build should get it out of the buildpack, not precompile
	if(gen.extends === isaOld){
		changed = true;
		gen.extends = isaNew;
		if(builtpack){
			builtGen.extends = gen.extends;
			builtpack.markModified('generators.'+gen.isa+".extends");
		}
	}

	// do the save
	// this must happen after pack save, so child name exists in pack
	if(changed) gen.save();
}


module.exports = Maintainer;