import { PROP_DESC } from "../components/Characters/Cards/CardsUtil";
import { swapComma, isHarryPotter, harryPotterify, abbreviate } from "./DDB";
import { CARD_DATA } from "./ShortDesc";

function makeContainer(label, arr) {
	var items = [];

	arr.forEach(g => {
		var name = swapComma(g.definition.name.toLowerCase());
		var showQuantity = g.quantity > 1 && !name.startsWith("ball bearings");

		items.push((showQuantity ? g.quantity + " " : "") + name);
	});
	return {
		name: label,
		content: items
	};
}

function cleanParagraphHTML(str) {
	return window
		.$("<div>" + str + "</div>")
		.find("p")
		.map((i, p) => {
			return p.innerText;
		})
		.toArray();
}

const getBody = ({
	eyes,
	skin,
	hair,
	age,
	height,
	weight,
	weightSpeeds: {
		normal: { walk, fly, burrow, swim, climb }
	}
}) => ({
	eyes,
	skin,
	hair,
	age,
	height,
	weight,
	speeds: { walk, fly, burrow, swim, climb }
});

const getBackground = ({
	features: { background: bg },
	currencies: coin = {},
	traits: { personalityTraits, ideals, bonds, flaws } = {}
}) => ({
	name: bg.hasCustomBackground ? bg.customBackground.name : bg.definition.name,
	personality: personalityTraits,
	ideal: ideals,
	bonds,
	flaws,
	startingCoin:
		(coin.pp ? coin.pp + "p" : "") +
		(coin.ep ? coin.ep + "e" : "") +
		(coin.gp ? coin.gp + "g" : "") +
		(coin.sp ? coin.sp + "s" : "") +
		(coin.cp ? coin.cp + "c" : "")
});

const defaultCharacterData = data => ({
	level: data.level,
	proficiencyBonus: data.proficiencyBonus,
	hitDice: [],
	body: getBody(data),
	background: getBackground(data),
	race: {
		name: isHarryPotter ? harryPotterify(data.race) : data.race,
		size: data.size
	},
	classes: [],
	abilities: {
		str: { base: data.stats.str, adjust: [] },
		dex: { base: data.stats.dex, adjust: [] },
		con: { base: data.stats.con, adjust: [] },
		int: { base: data.stats.int, adjust: [] },
		cha: { base: data.stats.cha, adjust: [] },
		wis: { base: data.stats.wis, adjust: [] }
	},
	features: [],
	proficiencies: {
		armor: [],
		weapons: [],
		skills: [],
		doubleSkills: [],
		languages: [],
		tools: [],
		doubleTools: []
	},
	advResist: {
		advantages: [],
		resistances: [],
		other: []
	},
	spellcasting: null
});

const getGearCard = ({ definition: { isConsumable, weight, description } }, name) => ({
	category: "item",
	name: name,
	consumable: isConsumable,
	weight: weight,
	healing: {
		diceString: "2d4 + 2",
		addModifier: false
	},
	description: cleanParagraphHTML(description)
});

function getWeaponCard(
	{
		definition: {
			name,
			range,
			isConsumable,
			weight,
			attackType,
			damage,
			damageType,
			longRange,
			category,
			properties
		}
	},
	cards
) {
	const shortRange = range && range > 5 ? range : undefined;

	name = swapComma(name);

	// only put weapon once
	if (cards.find(card => card.name === name)) return false;

	return {
		category: "item",
		name: name,
		consumable: isConsumable,
		weight: weight,
		attackType: attackType,
		damage: {
			diceString: damage.diceString,
			damageType: damageType,
			addModifier: true
		},
		range: shortRange,
		longRange: shortRange ? longRange : undefined,
		weaponCategory: category,
		properties: abbreviate
			? properties.map(p => {
					p.description = PROP_DESC[p.name];
					return p;
			  })
			: properties
	};
}

function getInventory({
	inventory: { armor = [], weapons = [], gear = [] } = {},
	notes: { personalPossessions }
}) {
	var equipment = {
		armor: {},
		containers: []
	};
	var cards = [];

	// armor ------
	armor = armor.filter(a => a.equipped);
	armor.forEach(arm => {
		if (arm.definition.name === "Shield") {
			equipment.hasShield = true;
		} else if (!arm.stackable) {
			equipment.armor = {
				name: arm.definition.name,
				data: {
					ac: arm.definition.armorClass,
					itemType: arm.definition.type
				}
			};
		} else {
			//todo stackable armor
		}
	});

	// weapons
	var weapCount = {};
	weapons.forEach(w => {
		let card = getWeaponCard(w, cards);
		if (card) cards.push(card);

		//weapCount
		if (!weapCount[card.name]) weapCount[card.name] = 0;
		weapCount[card.name]++;
	});
	var weaps = [];
	for (var w in weapCount) {
		weaps.push(weapCount[w] > 1 ? weapCount[w] + " " + w + "s" : w);
	}
	equipment.weapons = weaps.join(", ");

	var magic = makeContainer(
		"Magical",
		gear.filter(({ definition: { magic, subType } }) => magic || subType === "Potion")
	);
	var tools = makeContainer(
		"Tools",
		gear.filter(({ definition: { subType } }) => subType === "Tool")
	);
	var bp = makeContainer(
		"Backpack",
		gear.filter(
			({ definition: { magic, subType, name } }) =>
				subType !== "Tool" && subType !== "Potion" && !magic && name !== "Backpack"
		)
	);

	equipment.containers.push(bp);
	if (tools.content.length) equipment.containers.push(tools);
	if (magic.content.length) equipment.containers.push(magic);

	gear.forEach(e => {
		var addCard = e.definition.subType === "Potion";
		if (!addCard) return;
		cards.push(getGearCard(e, swapComma(e.definition.name)));
	});

	if (personalPossessions) equipment.containers.push({ content: [personalPossessions] });

	return { equipment, cards };
}

function getIcon(name) {
	switch (name) {
		case "Second Wind":
			return "svg game-icons/delapouite/originals/healing";
		default:
			return undefined;
	}
}

const getFeatureCard = (definition, limit) => {
	var abil = limit.find(a => a.name === definition.name);
	var activation = definition.activationType && definition.activationTime;
	const shortRange = definition.range && definition.range > 5 ? definition.range : undefined;
	const dmg = {
		diceString: definition.damage.diceString,
		damageType: definition.damageType,
		addModifier: true
	};
	const uses = {
		count: abil.maxUses,
		reset: abil.resetType.toLowerCase()
	};
	return {
		name: definition.name,
		category: "spell",
		consumable: definition.isConsumable,
		weight: definition.weight,
		attackType: definition.attackType,
		castTime: activation
			? definition.activationTime + " " + definition.activationType.toLowerCase()
			: "Modifier",
		range: shortRange,
		isFeature: true,
		icon: getIcon(definition.name),
		description: definition.description.replace("</p>", "").split("<p>"),
		longRange: shortRange ? definition.longRange : undefined,
		properties: definition.properties,
		damage: !definition.damage ? undefined : dmg,
		uses: !abil ? undefined : uses,
		...CARD_DATA[definition.name]
	};
};

export { defaultCharacterData, getInventory, getFeatureCard };
