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
		for(var name in updates){
			if(updates[name] === false){
				if(packThings[name]) packThings[name] = false;
				continue;
			}
			if(packThings.constructor.name === "Array"){
				packThings[name] = {
					contains: packThings[name]
				}
			}
			packThings[name] = {...packThings[name], ...updates[name]}
		}
		newPack = {...oldPack, ...newPack, things: packThings};
	}
	else{
		packName = 'nested-dnd-newpack';
	}
	var str = JSON.stringify(newPack);
	downloadJSON(str, packName);
	if(DEBUG) console.log(str);
	copyToClipboard(str);
}

export default ExportPackAction;