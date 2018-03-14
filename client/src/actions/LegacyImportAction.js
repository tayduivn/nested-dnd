import tableStore, { Table } from '../stores/tableStore';
import Contain from '../util/Contain';
import DB from './CRUDAction'

const PACKID = "5aa2f8c11e0a791ed4d0a547";

var storedTables = [];
var storedGenerators = [];

export default {
	allTables: function(){
		

		DB.getIn("tables", "pack", PACKID, function(result){
			storedTables = result;

			var tablesToStore = tableStore.getAll();
			for(var title in tablesToStore){
				if(title.includes(" ICONS")) continue;

				var data = tablesToStore[title];
				var alreadyStored = isTableInPack(title); 

				if(typeof data === "string"){
					continue;
				}

				if(data instanceof Array){
					data = {
						rows: data
					}
				}
				data.title = title;

				if(!alreadyStored){
					DB.create("pack/"+PACKID+"/table",data,(stored)=>{
						storedTables.push(stored);
					})
				}
			}
		});
	},
	oneThing: function(legacy){
		this.allTables();
	
		var importing = { ...legacy, 
			isa: legacy.name,
			extends: legacy.isa,
			displayName: legacy.namegen, //TODO
			style: {
				icon: convertTable(legacy.icon),
				textColor: convertTable(legacy.textColor),
				backgroundColor: convertTable(legacy.background),
				autoColor: (legacy.autoColor)
			}
		}

		console.log("IMPORTING--------")
		console.log(importing);

		DB.get("builtpack",PACKID,function(pack){

			storedGenerators = pack.generators;
			const existing = storedGenerators[importing.isa];

			//validate children
			//----------------------------------
			if(importing.contains){
				importing.children = importing.contains.map((c)=>{
					var contain = new Contain(c);
					var { value, type } = convertTable(c);

					value = (type === "string") ? contain.value : value;
					if(storedGenerators[value])
						type = "generator"; 

					return {
						type: type,
						value: value,
						amount: {
							min: contain.makeMin,
							max: contain.makeMax
						},
						chance: contain.makeProb,
						isEmbedded: contain.isEmbedded
					}
				});
			}
			//---------------------------------

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
		})
	}
}

function convertTable(inputValue){
	var type = "string";
	var value = inputValue;

	if(!value) return { type, value };

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

	if(typeof value === "string"){
		for(var str in replaceThese){
			if(value.trim() === "*"+str+"*")
				value = replaceThese[str];
		}
	}

	if(tableStore.isTableID(value)){
		//TODO add table to DB
		type = "tableID";

		value = tableStore.cleanTableID(value);
	}else if(tableStore.isRollable(value)){
		type = "table";
		if(value instanceof Array)
			value = new Table({ rows: value})
	}

	return {type,value};
}

function isTableInPack(title){
	return storedTables.find((table)=>{ return (table.title === title)})
}

function isInPack(isa, generators){
	return generators.find((entry)=>{ return (entry._id === isa)})
}