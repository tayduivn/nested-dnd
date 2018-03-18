import tableStore from '../stores/tableStore';
import thingStore from '../stores/thingStore';
import Contain from '../util/Contain';
import DB from './CRUDAction'
import PackLoader from '../util/PackLoader'

const PACKID = "5aac89021d9de21d4c482c35";
const UPLOADPACK = 'dnd';

var storedTables = null;
var allThingNames = [];

var builtpack;

var replaceThese = {
		"ICON ALIEN ABDUCTION": "fa flaticon-transport-1",
		"ICON CITY": "fa flaticon-city-1",
		"ICON CYBORG BODY": "fa flaticon-technology",
		"ICON CYBORG FACE": "fa flaticon-technology-1",
		"ICON DEATH STAR": "fa flaticon-transport",
		"ICON DESERT": "fa flaticon-nature-4",
		"ICON FUTURE CITY": "fa flaticon-city",
		"ICON GALAXY": "fa flaticon-nature",
		"ICON MACHINE": "fa flaticon-technology-2",
		"ICON MESA": "fa flaticon-nature-3",
		"ICON PLANET": "fa flaticon-nature-1",
		"ICON PLANET CORE": "fa flaticon-planet-1",
		"ICON PLANET RINGS": "fa flaticon-planet",
		"ICON PLANETS": "fa flaticon-solar-system",
		"ICON STAR SYSTEM": "fa flaticon-solar-system-1",
		"ICON TREES": "fa flaticon-nature-2"
	}


function getStoredTables(){
	if(!storedTables){
		return DB.get("pack/"+PACKID, "tables").then( ({ data })=>{
			storedTables = {};
			data.forEach(t=>{
				storedTables[t.title] = t;
			})
			return storedTables;
		});
	}
}

function toNewTableFormat(legacy, title, cleanThingFunc){
	var importing = {
		rows: legacy.rows
	}

	if(title) importing.title = title;
	if(legacy.concatenate) importing.concat = true;
	if(legacy.hasWeightedRows) importing.rowWeights = true;
	if(legacy.tableWeight) importing.tableWeight = legacy.tableWeight;

	if(title === 'URBAN QUEST HOOK'){
		console.log("STOP HERE");
	}

	// convertTable is for plain table rows
	// clean Thing if is an embedded if it is an embedded table
	importing.rows = legacy.rows.map((r)=>{
		return convertTable(r, false, cleanThingFunc);
	});

	return importing;
}

var Importer = {
	allTables: async function(){

		storedTables = await getStoredTables();

		var tablesToStore = tableStore.getAll();

		for(var title in tablesToStore){
			if(title.includes(" ICONS")) continue;

			var data = tablesToStore[title];
			var alreadyStored = !!storedTables[title] 

			if(typeof data === "string"){
				continue;
			}

			console.log(title+" ------------------------------")
			console.log(data);

			var importing = toNewTableFormat(
				((data instanceof Array) ? { rows: data } : data), 
				title,
				this.cleanThing
			);

			console.log(importing);
			console.log(" ")

			if(!alreadyStored){
				await DB.create("pack/"+PACKID+"/table", importing).then(storeTable)
			}else
				await DB.set("pack/"+PACKID+"/table", storedTables[title]._id, importing)					
		}// loop tableStore

		function storeTable(stored){
			storedTables[title] = (stored.data);
		}

	},
	oneThing: async function(legacy){
		// this.allTables(); //temp
		// const pack = {};
		const pack = {};
		pack.things = thingStore.getThings(); //all things loaded
		pack.defaultSeed = "item";
		allThingNames = Object.keys(pack.things);
		allThingNames = thingStore.getGenerators(allThingNames);
	
		await getStoredTables();
		var { error, data } = await DB.get("builtpack",PACKID);
		if(!error) builtpack = data;
		else console.error("Could not get builtpack");

		var importing = this.cleanThing(legacy, legacy.name);

		console.log("IMPORTING--------")
		console.log(importing);

		const existing = builtpack.generators[importing.isa];

		if(existing){
			var generatorID = existing.gen_ids.pop();

			var {error, data: updated} = await DB.set("pack/"+PACKID+"/generator", generatorID, importing);
			if(!error){
				console.log("Updated");
				console.log(updated);
			}
		}
		else{
			var { error, data: created } = await DB.create("pack/"+PACKID+"/generator", importing);
			if(!error){
				console.log("Created");
				console.log(created);
			}
			else{ // errored, store a dummy thing
				var { data: newCreated } = await DB.create("pack/"+PACKID+"/generator", { isa: importing.isa })

				if(newCreated){
					builtpack.generators[importing.isa] = newCreated;
				}
			}
		}
	
	},
	wholePack: async function(allPacks, updateOnly){

		var pack;
		if(allPacks){
			pack = {};
			pack.things = thingStore.getThings(); //all things loaded
			pack.defaultSeed = "universe";
		}else{
			pack = PackLoader.packs[UPLOADPACK];
			pack.defaultSeed = "item";
		}

		var thingsToUpload = {};
		allThingNames = Object.keys(pack.things);
		allThingNames = thingStore.getGenerators(allThingNames);


		await getStoredTables();
		//await this.allTables();
		
		
		// transform contains
		for( var name in pack.things ){
			if(!allThingNames.includes(name)){
				console.log(name+" is unique");
				continue;
			}
			var thing = this.cleanThing(pack.things[name], name);
			thingsToUpload[thing.isa] = thing;
		}

		console.log("DONE CLEAN ------------------------------------")

		

		var {error, data} = await DB.get("builtpack",PACKID);
		if(error)
			console.error(error);
		else
			builtpack = data;

		if(!builtpack.generators) 
			builtpack.generators = {};

		//const alreadyStored = Object.keys(builtpack.generators);


		if(updateOnly){
			var thingsByExtends = sortTheStuff(thingsToUpload);
			var namesByExtends = objectToArray(thingsByExtends);
			arrayUpload(namesByExtends, thingsToUpload, builtpack);
			
			
		}
		else{
	
	 		var success = {};
			var queue = [pack.defaultSeed];

			while(queue.length){
				var isa = queue.shift();

				if(success[isa] && success[isa].isa) return;

				if(name === 'supercluster'){
					console.log('stop');
				}

				var data = thingsToUpload[isa];
				if(!data){
					console.error('wut');
				}

				var ready = true;
				if(data.extends !== undefined && !success[data.extends]){
					
					if(!queue.includes(data.extends)){
						queue.unshift(data.extends);
						console.log("queued: "+data.extends);
					}
					if(!builtpack.generators[data.extends]) // not ready is not in builtpack yet
						ready = false;
				}
				if(data.in && data.in.length){
					data.in.forEach((child)=>{
						if(child.type === "generator" && !success[child.value] && child.value !== isa){
							
							if(!queue.includes(child.value)){
								queue.unshift(child.value) //add to queue to save
								console.log("queued: "+child.value);
							}
								
							if(!builtpack.generators[child.value]) // not ready is not in builtpack yet
								ready = false;
						}
					})
				}

				success[isa] = true;

				// push 
				if( ready ){

					if(builtpack.generators[isa] && success[isa] === true){ // && !alreadyStored.includes(isa)
						var updated = await DB.set("pack/"+PACKID+"/generator", builtpack.generators[isa].gen_ids[0], data)
							.catch(err=>{
								success[isa] = {};
								console.log("Not Updated: "+isa);
							});
						if(updated){
							success[isa] = updated;
							console.log("Updated: "+updated.isa);
						}
					}
					else if(!builtpack.generators[isa]) {
						var updated = await DB.create("pack/"+PACKID+"/generator", data)
							.catch(err=>{
								success[isa] = {};
								console.log("Not Added: "+isa);
							});
						if(updated){
							success[isa] = updated;
							console.log("Added: "+updated.isa);
						}
					}
				}
				else{
					if(!builtpack.generators[isa]){
						var updated = await DB.create("pack/"+PACKID+"/generator", { isa: isa })
							.catch(err=>{});

						builtpack.generators[isa] = updated;
					}
					queue.push(isa); // push to the end
				}
				
			}
		}

		
	},
	cleanThing: function(leg, name){

		console.log(name+" ------------------------------")
		console.log(leg);

		var legacy = leg;
		if(legacy instanceof Array){
			legacy = {
				contains: leg
			}
		}
		var importing = {
			isa: name
		}
		if(legacy.isa &&  legacy.isa !== name) {
			importing.extends = legacy.isa;
		}
		if(legacy.namegen) importing.name = convertTable(legacy.namegen, true);
		if(legacy.data) importing.data = legacy.data;
		var style = {};
		if(legacy.icon) style.icon = convertTable(legacy.icon);
		if(legacy.textColor) style.txt = convertTable(legacy.textColor);
		if(legacy.background) style.bg = convertTable(legacy.background);
		if(legacy.autoColor === false) style.noAutoColor = false;
		if(Object.keys(style).length){
			importing.style = style;
		}

		//validate children
		//----------------------------------
		if(legacy.contains && legacy.contains.length){

			importing.in = processContains.call(this, legacy.contains);
		}

		function processContains(arr){
			if(!allThingNames){
				console.error("Couldn't find global variable allThingNames");
			}

			return arr.map((c)=>{
				if(c === undefined || typeof c === "undefined"){
					console.error("contains undefined");
					return c;
				}

				var contain, value, type, weight;
				if(c instanceof Array){
					var toChild = convertTable(c);
					value = toChild.value;
					type = toChild.type;
					weight = toChild.weight;

					if(value && value.rows && value.rows.length && type === "table")
						
						var newArr = processContains.call(this, value.rows);
						if(newArr && newArr.length){
							newArr.forEach((r,i)=>{
								value.rows[i].value = r;
							})
						}
	
					contain = {};
				}
				else if(c.isa ||  c.namegen || c.name || c.contains){
					value = this.cleanThing(c);
					type = "embed";
					contain = {};
				}
				else{
					if(typeof c !== "string"){
						// is nested
						if(typeof c.value === "string"){
							value = c.value;
							type = c.type;
							weight = c.weight;
							contain = new Contain(value);
						}
						else if(c.namegen || c.contains){
							contain = {};
							value = this.cleanThing(c);
							type = "embed";
						}
						else{
							console.error("Contained item is not a string but doesn't have recognizable format!")
							value = c;
							contain = {};
						}
					}
					else{
						var cToChild = convertTable(c);
						value = cToChild.value;
						type = cToChild.type;
						weight = cToChild.weight;
						contain = new Contain(value);
					}
				}

				//value = (type === "string") ? contain.value : value;
				if(allThingNames.includes(value))
					type = "generator"; 

				var child = {
					value: value
				}
				if(type !== "string") child.type = type;

				if(contain.makeMax || (contain.makeMin !== undefined && contain.makeMin !== 1)){
					child.amount = {}
					if(contain.makeMin !== 1) child.amount.min = contain.makeMin
					if(contain.makeMax) child.amount.max = contain.makeMax
				}
				if(contain.makeProb < 100) child.chance = contain.makeProb;
				if(contain.isEmbedded) child.isEmbedded = true;

				if(weight) child.weight = weight;

				return child;
			});

			if(importing.in.length === 1 && importing.in[0].isEmbedded && importing.in[0].type === "generator"){
				importing.extends = importing.in[0].value;
				delete importing.in;
			}
		}
		//---------------------------------
		
		console.log(importing);
		return importing;
	}
}

/**
 * For converting table rows
 * @param  {[type]} inputValue      the row
 * @param  {[type]} unNestForSimple [description]
 * @param  {[type]} cleanThingFunc IF the table can have an embedded generator
 * @return {[type]}                 [description]
 */
function convertTable(inputValue, unNestForSimple, cleanThingFunc){
	var type;
	var value = inputValue;
	var weight;

	if(!value) return inputValue;


	//clean up random empty values in table
	if(value instanceof Array){
		var newArray = []
		var totalEmpty = 0;
		value.forEach((r,i)=>{
			if(r === ""){
				totalEmpty++;
			}
			else
				newArray.push({
					value: r,
					weight: 1
				})
		});
		if(totalEmpty){
			newArray.push({
				value: "",
				weight: totalEmpty
			})
			value = newArray;
		}
	}

	if(value instanceof Array && value.length === 1){
		value = value[0];
	}

	// un-nest value field
	while(value.weight !== undefined || value.value !== undefined){
		if(value.type !== undefined) type = value.type;
		if(value.weight !== undefined) weight = value.weight;
		if(value.value !== undefined) value = value.value; // must be last
	}

	// this row is an embedded thing
	if(value.isa || value.name || value.contains){ 
		value = cleanThingFunc(value)
		type = "embed";
	}

	if(typeof value === "string"){ //replace table names
		for(var str in replaceThese){
			value = value.replace("*"+str+"*", replaceThese[str])
		}
	}

	if(tableStore.isRollable(value)){
		if(!value.rows){
			value = tableStore.makeTable(value);
		}
		if(value.rows){

			// fix concatenate one array together
			if(value.rows.length === 1){
				value.rows = value.rows[0];
				if(value.concatenate)
					value.concatenate = false;
				if(tableStore.isRollable(value.rows)){
					type = "table";
				}
				else value = value.rows;
			}
			else type = "table";

			if(!(value.rows instanceof Array)){
				console.log("WHAT HAPPENED HERE");
			}

			if(type === "table"){
				value = toNewTableFormat(value, null, cleanThingFunc);
			}

		}
	}


	var result = {value};
	if(weight) result.weight = weight;
	if(type) result.type = type;

	replaceTableIds.call(this,result);

	// it's only a string, unfold if setting on
	if(unNestForSimple 
		&& (!result.type || result.type === "string") 
		&& !result.weight 
		&& typeof result.value === "string"){
		return result.value; // un-nest for simple objects
	}
	return result;

	function replaceTableIds(row){
		if(typeof row.value === "string"){
			var title = row.value.trim().substring(1, row.value.length-1)
			if(storedTables[title]){
				row.type = 'table_id';
				row.value = storedTables[title]._id;
			}
		}

		//recurse
		else if(row.value && row.value.rows){
			//can clean thing if parent could clean thing
			row.value.rows = row.value.rows.map(r=>{
				return convertTable(r, false, cleanThingFunc)
			})
		}
		else if(typeof row.value !== "string" && type !== "embed"){
			console.error("WHAT IS THIS");
		}

		return row;
	}
}


function sortTheStuff(thingsToUpload){
	var thingsByExtends = {};

	console.log("SORT ------------------------------------")
	for(var isa in thingsToUpload){
		var gen = thingsToUpload[isa]
		//console.log(gen);
		//things By Extends
		var currExtends = gen.extends;
		var extendArr = [gen.isa];
		while(currExtends){
			extendArr.unshift(currExtends);
			if(!thingsToUpload[currExtends]){
				console.error(extendArr[0]+" extends nonexistent "+currExtends);
				currExtends = null;
			}
			else{
				currExtends = thingsToUpload[currExtends].extends;
			}
		}

		console.log(extendArr.join(", "));

		var currParent = thingsByExtends;
		for(var i = 0; i < extendArr.length; i++){
			var ex = extendArr[i];
			if(!currParent[ex]){
				currParent[ex] = {};
			}
			currParent = currParent[ex];
		}
	}
	console.log("SORT DONE ------------------------------------")
	console.log(thingsByExtends);
	return thingsByExtends;

}

async function arrayUpload(names, thingsToUpload, builtpack){
	var couldntUpdate = [];

	for(var i = 0; i < names.length; i++){
		var isa = names[i];
		var t = thingsToUpload[names[i]];

		if(isa === "supercluster"){
			console.log("test");
		}

		//create
		if(!builtpack.generators[isa]){
			var {error, data: created } = await DB.create("pack/"+PACKID+"/generator", t);
			if(error){
				couldntUpdate.push(isa);
				console.log("Couldn't create "+isa);
			}
			// if(created)
			// 	console.log("Created "+isa);
		}
		// update
		else{
			// console.log("Already uploaded: "+isa);
			/*
			var { error, data: updated } = await DB.set("pack/"+PACKID+"/generator", builtpack.generators[isa].gen_ids[0], t)
			if(error){
				couldntUpdate.push(isa);
				console.log("Couldn't update "+isa);
			}
			if(updated)
				console.log("Updated "+isa);
			*/
		}
	};

	console.log("DONE UPDATE ------------------------------------------");
	console.log("COULDNT UPLOAD:" + couldntUpdate);

	return couldntUpdate;
}

function objectToArray(obj){
	var array = [];
	array = array.concat(Object.keys(obj));
	for(var name in obj){
		array = array.concat(objectToArray(obj[name]))
	}
	return array;
}

/*
function isInPack(isa, generators){
	return generators.find((entry)=>{ return (entry._id === isa)})
}*/

export default Importer;