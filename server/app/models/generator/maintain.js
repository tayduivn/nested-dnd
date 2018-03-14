
var Maintainer = {

	getGeneratorChildren: function(arr, oldname, newname){
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

	renameChildren: function(node, oldname, newname){
		if(!node || !node.in) return false;
		var changed = false;

		node.in.forEach((child, i)=>{
			//termination condition
			if(child.type === "generator" && child.value === oldname){
				child.value = newname;
				changed = true;
			}
			// recurse
			else if(child.type === "embed" && child.value.in){
				var newChild = this.renameChildren(child.value, oldname, newname);
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


	insertNew: function(data, pack, builtpack, Generator, callback){

		//validate in
		if(data.in){
			var isas = this.getGeneratorChildren(data.in);
			for(var i = 0; i < isas.length; i++){
				if(!builtpack.generators[isas[i]]){
					return callback({ error: "Could not find child generator that is a "+isas[i]})
				}
			}
		}

		Generator.create(data, function(err, gen) {
			if (err) return callback(err);

			//add to builtpack
			builtpack.rebuildGenerator(gen.isa, pack,  function(err, res){
				if(err) return callback(err);
				callback(err, gen);
			});
		});
	},

	cleanAfterRemove: function(gen){
		gen.model('BuiltPack').findById(gen.pack_id, (err, builtpack)=>{
			if(err) return console.error(err);

			// clean up form build pack
			delete builtpack.generators[gen.isa];
			this.markModified('generators');
			builtpack.save((err)=>{
				console.error(err);
				throw err;
			});
		})
	},

	rename: async function(generator, pack, oldname){
		if(!generator) return null;

		var newname = generator.isa;
		var Generator = generator.model('Generator');
		var BuiltPack = generator.model('BuiltPack');
		
		var result = await Promise.all([
			// find generators in this pack that contain in or extend with oldname
			Generator.find({ pack_id: pack._id }).exec(),

			BuiltPack.findOrBuild(pack),

			// set seed ----------------------------
			pack.renameseed(oldname, newname) 
		]);
		var gens = result[0];
		var builtpack = result[1];

		//move in builtpack
		delete builtpack.generators[oldname];
		builtpack.markModified('generators.'+oldname)
		builtpack.pushGenerator(generator);

		
		if(!gens || !gens.length) {
			builtpack.save();
			return generator;
		}

		gens.forEach((gen)=>{
			var changed = false;
			var newGen = this.renameChildren(gen, oldname, newname);
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
			if(gen.extends === oldname){
				changed = true;
				gen.extends = newname;
				builtGen.extends = gen.extends;
				builtpack.markModified('generators.'+gen.isa+".extends");
			}

			// do the save
			// this must happen after pack save, so child name exists in pack
			if(changed) gen.save();
		});

		// push in and extends changes to buildpack. no need to rebuild
		builtpack.save();
		return generator;
	}
}




module.exports = Maintainer;