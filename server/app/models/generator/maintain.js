
var Maintainer = {

	/**
	 * Get all of the isas of children that are of type "generator", even in embedded documents
	 * @param  {Object[]} arr     children following childSchema
	 * @return {string[]}         isa
	 */
	getGeneratorChildren: function(arr){
		if(!arr) return [];
		var isas = [];

		for(var i = 0; i < arr.length; i++){
			//termination condition
			if(arr[i].type === "generator"){
				isas.push(arr[i].value);
			}
			// recurse
			if(arr[i].in){
				isas = isas.concat(this.getGeneratorChildren(arr[i].in));
			}
		}

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

		//validate isa
		if(builtpack.generators[data.isa]){
			var e = new Error(data.isa+" generator already exists in pack "+pack._id);
			e.name = "Precondition Failed"
			throw e;
		}

		//validate in
		if(data.in){
			var isas = this.getGeneratorChildren(data.in);

			for(var i = 0; i < isas.length; i++){
				if(!builtpack.generators[isas[i]]){
					var e = new ReferenceError("Could not find child generator that is a "+isas[i])
					e.name = "Precondition Failed"
					throw e;
				}
			}
		}

		var gen = await pack.model('Generator').create(data)

		//add to builtpack
		await builtpack.rebuildGenerator(gen.isa, pack)

		return gen;
	},

	/**
	 * Removes a generator from the build after it was deleted
	 * @return {BuiltPack} the modified builtpack
	 * @this {Generator}
	 */
	cleanAfterRemove: async function(){
		var builtpack = await this.model('BuiltPack').findById(this.pack_id).exec();

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
	rename: async function(generator, pack, isaOld){
		if(!generator) return null;

		var isaNew = generator.isa;
		var Generator = generator.model('Generator');
		var BuiltPack = generator.model('BuiltPack');
		
		var result = await Promise.all([
			// find generators in this pack that contain in or extend with isaOld
			Generator.find({ pack_id: pack._id }).exec(),

			BuiltPack.findOrBuild(pack),

			// set seed ----------------------------
			pack.renameSeed(isaOld, isaNew) 
		]);
		var gens = result[0];
		var builtpack = result[1];

		//move in builtpack
		delete builtpack.generators[isaOld];
		builtpack.markModified('generators.'+isaOld)
		builtpack.pushGenerator(generator);

		
		if(!gens || !gens.length) {
			builtpack.save();
			return;
		}

		gens.forEach((gen)=>{
			var changed = false;
			var newGen = this.renameChildren(gen, isaOld, isaNew);
			var builtGen = builtpack.generators[gen.isa];

			if(!builtGen){
				throw new Error("Could not find build for "+gen.isa+" in pack "+gen.pack_id);
			}

			if(newGen){
				changed = true;
				gen = newGen;
				builtGen.in = newGen.in;
				builtpack.markModified('generators.'+newGen.isa+".in");
			}

			// just rename extends -- the build should get it out of the buildpack, not precompile
			if(gen.extends === isaOld){
				changed = true;
				gen.extends = isaNew;
				builtGen.extends = gen.extends;
				builtpack.markModified('generators.'+gen.isa+".extends");
			}

			// do the save
			// this must happen after pack save, so child name exists in pack
			if(changed) gen.save();
		});

		// push in and extends changes to buildpack. no need to rebuild
		await builtpack.save();
	}
}




module.exports = Maintainer;