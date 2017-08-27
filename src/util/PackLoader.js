import thingStore from '../stores/thingStore.js';
import tableStore from '../stores/tableStore.js';
let vm = require('vm');

var packsAreLoaded = false;
var result = {
	defaultSeed: "",
	tables: []
};

class Pack{
	constructor(options){
		this.name = options.name;
		this.version = options.version;
		this.description = options.description;
		this.author = options.author;
		this.dependencies = options.dependencies;
		this.defaultSeed = options.defaultSeed;
		this.things = options.things || {};
		this.tables = options.tables || [];
		this.beforeLoad = options.beforeLoad;
		this.afterLoad = options.afterLoad;
	}
	load(result){
		if(typeof this.beforeLoad === "function")
			this.beforeLoad(thingStore, tableStore);

		if(this.defaultSeed)
				result.defaultSeed = this.defaultSeed;

		thingStore.addAll(this.things);
		tableStore.addAll(this.tables);

		if(typeof this.afterLoad === "function")
			this.afterLoad(thingStore, tableStore);

		console.log("Loaded pack: "+this.name
			+"\n\t Added "+Object.keys(this.things).length+" things."
			+"\n\t Added "+Object.keys(this.tables).length+" tables.");
	}
	checkDependencies(loaded){
		var _this = this;
		this.dependencies.forEach(function(dependency){
			if(!loaded.includes(dependency))
				throw new Error(_this.name+" requires "+dependency+" to be loaded first.");
		});
	}
}

var PackLoader = {};

PackLoader.load = function(callback){
	if(packsAreLoaded){
		callback(result);
		return result;
	}

	var packs = localStorage["packs"];
	if(!packs){
		localStorage["packs"] = packs = ["./packs/nested-orteil.json","./packs/nested-orteil-extended.json"];
	}else{
		packs = packs.split(",");
	}

	//load each pack
	var numFetched = 0;
	packs.forEach(function(url, index){

		fetch(url).then(function(response){
			if(url.endsWith('.json'))
				return response.json();
			else
				return response.text();
		})
		.then(function(pack){
			if(typeof pack === "string"){
				pack = vm.runInThisContext(pack, 'remote_modules/nestedscript.js');
			}
			packs[index] = new Pack(pack);
			numFetched++;

			//done
			if(numFetched === packs.length){
				var loaded = [];
				packs.forEach(function(pack){
					if(pack == null) return;
					pack.checkDependencies(loaded);
					pack.load(result);
					loaded.push(pack.name);
				})

				if(!localStorage["seed"]){
					localStorage["seed"] = result.defaultSeed;
				}
				
				packsAreLoaded = true;
				callback(result);
			}
		})
		.catch((error) => {
			numFetched++;
			packs[index] = null;
			console.error("could not load pack "+url);
			console.error(error);
		});
	});
}

export default PackLoader;