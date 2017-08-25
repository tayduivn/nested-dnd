import Thing from './Thing.js';
import Table from './Table.js';
import Styler from './Styler.js';

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
			this.beforeLoad();

		if(this.defaultSeed)
				result.defaultSeed = this.defaultSeed;

		//create things
		var thing;
		for(var name in this.things){
			thing = this.things[name];
			if(thing instanceof Array){
				thing = {contains:[].concat(thing)}
			}
			thing = new Thing(Object.assign({name:""+name}, thing));
			Styler.addThing(thing);
		}

		Table.addTables(this.tables);

		if(typeof this.beforeLoad === "function")
			this.afterLoad();

		console.log("Loaded pack: "+this.name
			+"\n\t Added "+Object.keys(this.things).length+" things."
			+"\n\t Added "+Object.keys(this.tables).length+" tables.");
	}
	checkDependencies(loaded){
		this.dependencies.forEach(function(dependency){
			if(!loaded.includes(dependency))
				throw new Error(this.name+" requires "+dependency+" to be loaded first.");
		});
		loaded.push(this.name);
	}
}

Pack.doImport = function(callback){
	var packs = localStorage["packs"];
	if(!packs){
		localStorage["packs"] = packs = ["./packs/nested-orteil.json","./packs/nested-orteil-extended.json"];
	}else{
		packs = packs.split(",");
	}

	var result = {
		defaultSeed: "",
		tables: []
	};

	//load each pack
	var numFetched = 0;
	packs.forEach(function(url, index){

		fetch(url).then((response) => response.json())
		.then(function(pack){
			packs[index] = new Pack(pack);
			numFetched++;

			//done
			if(numFetched === packs.length){
				var loaded = [];
				packs.forEach(function(pack){
					if(pack == null) return;
					pack.checkDependencies(loaded);
					pack.load(result);
				})
				callback(result);
			}
		})
		.catch((error) => {
			numFetched++;
			packs[index] = null;
			console.error("could not load pack"+url+": "+error);
		});
	});

	
}

export default Pack;