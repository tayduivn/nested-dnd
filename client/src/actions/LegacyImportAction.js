import tableStore, { Table } from '../stores/tableStore';
import thingStore from '../stores/thingStore';
import Contain from '../util/Contain';
import DB from './CRUDAction'
import PackLoader from '../util/PackLoader'

const PACKID = "5aa2f8c11e0a791ed4d0a547";
const UPLOADPACK = 'nested-orteil-extended';

var storedTables = null;
var storedGenerators = [];

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


async function getStoredTables(){
	if(!storedTables){
		var tables = await DB.getIn("tables", "pack", PACKID);
		storedTables = {};
		tables.forEach(t=>{
			storedTables[t.title] = t;
		})
		return storedTables;
	}
}

function toNewTableFormat(legacy, title){
	var importing = {
		rows: legacy.rows
	}

	if(title) importing.title = title;
	if(legacy.concatenate) importing.concat = true;
	if(legacy.hasWeightedRows) importing.rowWeights = true;
	if(legacy.tableWeight) importing.tableWeight = legacy.tableWeight;

	if(title === 'ANCIENT PERSON'){
		console.log("STOP HERE");
	}

	importing.rows = legacy.rows.map((r)=>convertTable(r));

	return importing;
}

export default {
	allTables: async function(){

		await getStoredTables();

		var tablesToStore = tableStore.getAll();

		for(var title in tablesToStore){
			if(title.includes(" ICONS")) continue;

			var data = tablesToStore[title];
			var alreadyStored = !!storedTables[title] 

			if(typeof data === "string"){
				continue;
			}

			var importing = toNewTableFormat(((data instanceof Array) ? { rows: data } : data), title);

			console.log(title+" ------------------------------")
			console.log(data);
			console.log(importing);
			console.log(" ")

			if(!alreadyStored){
				await DB.create("pack/"+PACKID+"/table",importing).then(storeTable)
			}else
				await DB.set("pack/"+PACKID+"/table", storedTables[title]._id, importing)					
		}// loop tableStore

		function storeTable(stored){
			if(stored)
				storedTables[stored.title] = (stored);
		}

	},
	oneThing: async function(legacy){
		// this.allTables(); //temp
	
		
		builtpack = await DB.get("builtpack",PACKID);
		var importing = this.cleanThing(legacy, legacy.name, builtpack);

		console.log("IMPORTING--------")
		console.log(importing);

		const existing = builtpack.generators[importing.isa];

		if(existing){
			var generatorID = existing._generators.pop()._id
			DB.set("pack/"+PACKID+"/generator", generatorID, importing, function(updatedGen){
				console.log("DONE--------")
				console.log(updatedGen);
			})
		}
		else{
			DB.create("pack/"+PACKID+"/generator", importing, function(updatedGen){
				console.log("DONE--------")
				console.log(updatedGen);
			})
		}
	
	},
	wholePack: async function(){

		await getStoredTables();
		//await this.allTables();
		
		// one pack
		const pack = PackLoader.packs[UPLOADPACK];
		
		//const pack = {};
		//pack.things = thingStore.getThings(); //all things loaded
		//pack.defaultSeed = "universe";

		var thingsToUpload = {};
		var allThingNames = Object.keys(pack.things);

		
		// transform contains
		for( var name in pack.things ){
			var thing = this.cleanThing(pack.things[name], name, allThingNames, storedTables);
			thingsToUpload[thing.isa] = thing;
		}

		builtpack = await DB.get("builtpack",PACKID);
		const alreadyStored = Object.keys(builtpack.generators);

		
		for(var isa in thingsToUpload){
			var t = thingsToUpload[isa];

			if(isa === "supercluster"){
				console.log("test");
			}
			if(!builtpack.generators[isa]){
				await DB.create("pack/"+PACKID+"/generator", t, function(updated){
					console.log("Created: "+updated.isa);
				}).catch(err=>{
					console.log("Not Added: "+err);
				});
			}
			else{
				var updated = await DB.set("pack/"+PACKID+"/generator", builtpack.generators[isa].gen_ids[0], t)
					.catch(err=>{
						console.log("Not Updated: "+isa);
					});
				if(updated)
					console.log("Updated "+updated.isa)
			}
		}


/*
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
				else if(!builtpack.generators[isa] && !success[isa]) {
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
*/
		
	},
	cleanThing: function(leg, name, allThingNames, storedTables){

		if(name === 'supercluster'){
			console.log('stop');
		}

		var legacy = leg;
		if(legacy instanceof Array){
			legacy = {
				contains: leg
			}
		}
		var importing = {
			isa: name
		}
		if(legacy.isa) importing.extends = legacy.isa;
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

			importing.in = legacy.contains.map((c)=>{
				var contain = new Contain(c);
				var { value, type, weight } = convertTable(contain.value);

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

				return child;
			});

			if(importing.in.length === 1 && importing.in[0].isEmbedded && importing.in[0].type === "generator"){
				importing.extends = importing.in[0].value;
				delete importing.in;
			}
		}
		//---------------------------------
		
		console.log(name+" ------------------------------")
		console.log(leg);
		console.log(importing);
		return importing;
	}
}

function convertTable(inputValue, unNestForSimple){
	var type;
	var value = inputValue;
	var weight;

	if(!value) return { value };

	if(value instanceof Array && value.length === 1){
		value = value[0];
	}

	// un-nest value field
	while(value.weight !== undefined || value.value !== undefined){
		if(value.type !== undefined) type = value.type;
		if(value.value !== undefined) value = value.value;
		if(value.weight !== undefined) weight = value.weight;
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
				value = toNewTableFormat(value);
			}

		}
	}
	else if(typeof value === "string"){ //replace table names
		for(var str in replaceThese){
			value = value.replace("*"+str+"*", replaceThese[str])
		}
	}


	var result = {value};
	if(weight) result.weight = weight;
	if(type) result.type = type;

	replaceTableIds(result);

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
			row.value.rows = row.value.rows.map(r=>{return convertTable(r)})
		}
		else if(typeof row.value !== "string"){
			console.error("WHAT IS THIS");
		}

		return row;
	}
}

/*
function isInPack(isa, generators){
	return generators.find((entry)=>{ return (entry._id === isa)})
}*/