class Container {
	constructor({ name, content }) {
		this.name = name;
		this.content = content;
	}
}

export default class Equipment {
	constructor(
		{ hasShield = false, armor = false, weapons, containers = [], items = [] },
		character
	) {
		if (armor) armor = armor.toLowerCase();
		// this.armor = armor && thingStore.exists(armor) ? thingStore.get(armor) : false;
		this.hasShield = !!hasShield;
		this.weapons = weapons;
		this.containers = containers.map(c => new Container(c));
		this.items = [];
		this.character = character;

		items.forEach(item => {
			/*if (thingStore.exists(item)) {
				this.items.push(thingStore.get(item));
				return;
			}
			item = item.toLowerCase();
			if (thingStore.exists(item)) this.items.push(thingStore.get(item));
			else console.error(item + " does not exist");*/
		});
	}
	getAC() {
		if (!this.armor) return this.getUnarmoredAC();

		const DEX = this.character.abilities.Dexterity.getMod();
		var ac = this.armor.data.AC;

		if (this.armor.data["Item Type"] === "Light Armor") {
			ac += DEX;
		} else if (this.armor.data["Item Type"] === "Medium Armor") {
			if (DEX === 1) ac += 1;
			else ac += 2;
		}

		if (this.hasShield) {
			ac += 2;
		}

		return ac;
	}
	getUnarmoredAC() {
		var DEX = this.character.abilities.Dexterity.getMod();
		var CON = this.character.abilities.Constitution.getMod();
		var WIS = this.character.abilities.Wisdom.getMod();

		if (this.character.isClass("Barbarian")) return 10 + DEX + CON;
		if (this.character.isClass("Monk")) return 10 + DEX + WIS;
		if (this.character.isSubclass("Sorcerous Origin", "Draconic Bloodline"))
			return 13 + DEX;
		return 10 + DEX;
	}
	getUnshieldedAC() {
		if (this.hasShield) return this.getAC() - 2;
		else return this.getAC();
	}
}
