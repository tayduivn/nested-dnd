import {copyToClipboard,downloadJSON} from '../util/util.js';
import PackLoader from '../util/PackLoader.js';

const DEBUG = false;

function ExportPackAction(packName, newPack){
	if(packName){
		//temp, until I get table explorer done
		delete newPack.tables;

		var updates = newPack.things;
		var oldPack = PackLoader.packs[packName];
		var packThings = {...oldPack.things};

		//loop things -- putting into packThings.
		for(var name in updates){

			// delete thing
			if(updates[name] === false){
				// will overwrite dependencies
				if(isInDependencies(name, oldPack)){
					packThings[name] = false;
				}
				else{
					delete updates[name];
					delete packThings[name];
				}
				continue;
			}

			// convert array to obj
			if(packThings[name] && packThings[name].constructor.name === "Array"){
				packThings[name] = {
					contains: packThings[name]
				}
			}

			// save into packThings
			packThings[name] = {...packThings[name], ...updates[name]}

			// handle rename
			if(packThings[name].name){
				var newName = packThings[name].name
				delete packThings[name].name;
				packThings[newName] = packThings[name];
			}
			
			//check for null/undefined values
			for(var property in packThings[name]){
				var thing = packThings[name];

				if(thing[property] === null && !definedInDependencies(property, name, oldPack)){
					delete packThings[name][property];
				}
				if(thing[property] === undefined && definedInDependencies(property, name, oldPack)){
					packThings[name][property] = null;
				}
			}
		}//done looping things

		oldPack.things = packThings;

		newPack = {...oldPack, ...newPack, things: packThings};
	}
	else{
		packName = 'nested-dnd-newpack';
	}
	var str = JSON.stringify(newPack);
	downloadJSON(newPack, packName);
	if(DEBUG) console.log(str);
	copyToClipboard(str);
}

function definedInDependencies(property, name, oldPack){
	oldPack.dependencies.forEach((packName) => {
		var dep = PackLoader.packs[packName].things;
		if(dep[name] && dep[name][property] !== undefined && dep[name][property] !== null)
			return true;
	});
	return false;
}

function isInDependencies(name, oldPack){
	if (oldPack.things[name] === undefined) return false;

	for(var i = 0; i < oldPack.dependencies.length; i++){
		var dep = PackLoader.packs[oldPack.dependencies[i]].things;
		if(dep[name] !== false)
			return true;
	}

	return false;
}

export default ExportPackAction;