
const PROP_DESC = {
	Light:
		"With two light weapons, you can attack with main hand and use bonus action to make an offhand attack",
	Finesse: "Can use DEX modifier for attack and damage",
	Heavy: "Small creatures have disadvantage on attack rolls",
	Versatile: "Can be used with either one or two hands",
	Loading: "Can fire only once per action, bonus action, or reaction",
	Reach: "Adds 5ft to your reach"
};

const MARTIAL_WEAPONS = "Battleaxe, Flail, Glaive, Greataxe, Greatsword, Halberd, Lance, Longsword, Maul, Morningstar, Pike, Rapier, Scimitar, Shortsword, Trident, War Pick, Warhammer, Whip, Blowgun, Hand Crossbow, Heavy Crossbow, Longbow, Net".split(
	", "
);

const SPELL_LVL_ICONS = ["⓪", "❶", "❷", "❸", "❹", "❺", "❻", "❼", "❽", "❾", "❿"];

const DMG_ICONS = {
	piercing: "gi gi-broadhead-arrow", // // fa-magic  // fa-superpowers
	slashing: "gi gi-quick-slash", //fa-tint
	bludgeoning: "fa fa-gavel",
	fire: "glyphicon glyphicon-fire",
	cold: "fa fa-snowflake-o",
	poison: "gi gi-poison-gas",
	acid: "fa fa-radioactive", //fa-flask
	psychic: "gi gi-brain",
	necrotic: "gi gi-raise-zombie",
	radiant: "gi gi-sundial",
	lightning: "fa fa-bolt",
	thunder: "gi gi-ultrasound",
	force: "gi gi-windy-stripes"
};

const DMG_NAME = {
	piercing: "pierce", // // fa-magic  // fa-superpowers
	slashing: "slash", //fa-tint
	bludgeoning: "bludgeon"
};

const CARDS_PER_PAGE = 4;

function getDamageTypeIcon(type) {
	if (!type || !type.toLowerCase) return "";
	return DMG_ICONS[type.toLowerCase()];
}

function getDamageTypeName(type) {
	if (!type || !type.toLowerCase) return "";

	let _type = type.toLowerCase();
	if (DMG_NAME[_type]) 
		return DMG_NAME[_type];

	return DMG_ICONS[_type] ? _type : type;
}

function recalcFontSize(t) {
	var availablePx =
		t.parentElement.offsetHeight -
		t.offsetTop -
		t.nextElementSibling.offsetHeight;
	if (t.offsetHeight > availablePx) {
		var fontsize = parseInt(t.style.fontSize, 10) - 0.1;
		t.style.fontSize = fontsize + "px";
		setTimeout(function() {
			recalcFontSize(t);
		}, 100);
		return true;
	}
}

export { recalcFontSize, getDamageTypeName, getDamageTypeIcon, CARDS_PER_PAGE, SPELL_LVL_ICONS, MARTIAL_WEAPONS, PROP_DESC }