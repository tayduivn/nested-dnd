import Character from "./Character";

class CharacterStore {
	constructor() {
		this.characters = [];
	}
	addAll(characters = []) {
		if (!characters.map) characters = [];
		this.characters = [...this.characters, ...characters];
	}
	getAll() {
		let unsorted = this.characters.map(c => new Character(c));
		return unsorted.sort((a, b) => {
			let nameComp = a.name.localeCompare(b.name);
			if (nameComp) return nameComp;
			let playerComp = a.player.localeCompare(b.player);
			if (playerComp) return playerComp;
			return a.level - b.level;
		});
	}
	getRaw(index) {
		return this.characters[index];
	}
	update(index, raw) {
		this.characters[index] = raw;
	}
}

let characterStore = new CharacterStore();
export default characterStore;
