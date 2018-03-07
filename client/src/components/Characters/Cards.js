import React from "react";
import "./Cards.css";

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

export default class Cards extends React.Component {
	componentDidUpdate() {
		var arr = document.getElementsByClassName("desc");
		for (var i = 0; i < arr.length; i++) {
			arr[i].style.fontSize = "14px";
			recalcFontSize(arr[i]);
		}
	}
	renderFrontBack() {
		if (!this.props.character) return <div />;

		var pages = [];
		var cards = [];
		let c = this.props.character;
		const ALL_CARDS = c.cards.get();
		const LVL = c.getTotalLevel();
		let name = (c.name) ? c.name+" "+LVL: c.classes[0].name+" "+LVL;

		for (var i = 0; i < ALL_CARDS.length; i++) {
			cards.push(ALL_CARDS[i]);
			if (
				cards.length === 9 ||
				(ALL_CARDS.length && i === ALL_CARDS.length - 1)
			) {
				pages.push(
					<Page cards={cards} side="front" key={pages.length} name={name} />
				);
				pages.push(
					<Page cards={cards} side="back" key={pages.length}  name={name} />
				);
				cards = [];
			}
		}
		return (
			<div>
				{pages}
			</div>
		);
	}
	render() {
		if (!this.props.character || !this.props.character.cards)
			return <div />;

		var pages = [];
		const ALL_CARDS = this.props.character.cards.get();
		let c = this.props.character;
		const LVL = c.getTotalLevel();
		let name = (c.name) ? c.name+" "+LVL: c.classes[0].name+" "+LVL;
		pages.push();

		var cards = [];

		for (var i = 0; i < ALL_CARDS.length; i++) {
			cards.push(ALL_CARDS[i]);
			if (
				cards.length === CARDS_PER_PAGE ||
				(ALL_CARDS.length && i === ALL_CARDS.length - 1)
			) {
				pages.push(
					<Page cards={cards} side="front" key={pages.length} name={name} />
				);
				cards = [];
			}
		}
		return (
			<div>
				{pages}
			</div>
		);
	}
}

class ItemBack extends React.Component {
	/**
	 * @prop {Card} item
	 */
	render() {
		var item = this.props.item;

		var props = [];

		// for potions of healing and special consumables
		if (item.description && !item.properties) {
			item.description.forEach(function(desc, index) {
				props.push(
					<p key={"desc" + index}>
						{desc}
					</p>
				);
			});
		}
		if(item.properties){
			item.properties.forEach(function(prop, index) {
				if (prop === "Range") return;
				props.push(
					<p key={"prop" + index}>
						<strong>{prop}</strong> {PROP_DESC[prop]}
					</p>
				);
			});
		}

		

		//todo: simple weapon list
		var type = MARTIAL_WEAPONS.includes(item.name)
			? "martial"
			: item.consumable ? "consumable" : "simple";

		return (
			<div className={"card weapon" + (item.consumable ? " red" : item.charges ? " purple": "")}>
				<div className="card-inner">
					<h2>
						{item.name}
					</h2>
					<div className="castTime">
						<em>
							{item.cast_time
								? item.cast_time
								: "1 action"}
						</em>
					</div>
					<InfoPanel
						range={item.range}
						duration={item.duration}
						concentration={item.concentration}
					/>
					<div className="desc">
						<p className={item["Item Type"] === "Wand" ? "hidden": ""}>
							<strong>
								{item["Item Type"]}
							</strong>
						</p>
						{props}
					</div>
					<div className="pin-bottom">
						{item.Weight ? item.Weight+" lb." : ""} 
						<span>{type}</span>
					</div>
				</div>
			</div>
		);
	}
}

class WriteIn extends React.Component {
	render() {
		let writein = (
			<div className="write-in">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
		);

		let damageDice = false;
		if (this.props.progression && this.props.level === 0) {
			damageDice = writein;
		} else if (
			this.props.dice &&
			this.props.dice.includes &&
			this.props.dice.includes("0.49")
		) {
			damageDice = (
				<p>
					{this.props.dice
						.replace("0.49", "1")
						.replace("level", "2 levels")}
				</p>
			);
		} else if (
			this.props.dice &&
			(!this.props.progression || this.props.level > 0)
		) {
			damageDice = (
				<p>
					{this.props.dice}
				</p>
			);
		}

		return (
			<div className={this.props.className}>
				<label>
					{this.props.label}
				</label>
				{damageDice}
				{this.props.writein ? writein : ""}
				<p className="damageType">
					<i className={getDamageTypeIcon(this.props.dmgType)} />{" "}
					{getDamageTypeName(this.props.dmgType)}
				</p>
				<p>
					{this.props.save}
				</p>
			</div>
		);
	}
}

class ItemFront extends React.Component {
	/**
	 * @param {Card} item 
	 */
	render() {
		var item = this.props.item;

		var rollValues = <p />;
		if (item.dice || item.charges || item.shortDesc || item.save) {
			rollValues = (
				<div className="roll-values pin-bottom">
					<p className="shortDesc">
						{item.shortDesc}
					</p>
					{item.charges
						? <div>
								<WriteIn
									label="Charges"
									dice={"❍".repeat(item.charges.count)}
								/>
								<WriteIn
									className="higherLevelDmg"
									label="&nbsp;&nbsp;&nbsp;&nbsp; Regain Daily"
									dice={item.charges.daily_regain}
								/>
							</div>
						: ""}
					{item.dice && item.dice.attack
						? <WriteIn
								label="Attack"
								dice={item.dice.attack}
								dmgType={item["Item Type"].replace(" Weapon","")}
								writein={true}
							/>
						: ""}
					{item.save
						? <WriteIn
								label="Save"
								save={item.save.throw}
								writein={false}
							/>
						: ""}
					
					{item.save && item.save.success
						? <div className="save-success">
								{(item.save.dc ? "DC"+item.save.dc+" " : "")+item.save.success}
							</div>
						: ""}
						{item.dice && item.dice.roll && item.dice.type !== "Healing"
						? <WriteIn
								label="Damage"
								dice={item.dice ? item.dice.roll : ""}
								dmgType={item.dice.type}
								writein={item.dice.add_modifier === true}
							/>
						: ""}
					{item.dice && item.dice.type === "Healing"
						? <WriteIn
								label="Heal"
								dice={item.dice.roll}
								writein={
									item.dice.add_modifier && !item.consumable
								}
							/>
						: ""}
					{item.dice && item.dice.roll_2hand
						? <WriteIn
								label="&nbsp;&nbsp;2-hand"
								dice={item.dice.roll_2hand}
							/>
						: ""}
					{item.dice && item.dice.progression && item.level !== 0  && (typeof item.dice.progression === "string")
					? <WriteIn
							className="higherLevelDmg"
							label={"	↑"+ (item.charges ? "Charges" : "Levels")}
							dice={
								"+" + item.dice.progression + " per "+(item.charges ? "charge" : "slot level")
							}
							writein={false}
						/>
					: ""}
				</div>
			);
		}

		return (
			<div className={"card weapon" + (item.consumable ? " red" : item.charges ? " purple": "")}>
				<div className="card-inner front">
					<h1>
						{item.name.trim().length
							? item.name
							: "________________"}
					</h1>
					<i className={"img gi gi-" + item.thing.getIcon()} />
					{rollValues}
				</div>
			</div>
		);
	}
}

class SpellFront extends React.Component {
	render() {
		var spell = this.props.spell;
		var className = parseInt(spell.level, 10) > 0 ? " purple" : "";
		className +=
			spell.cast_time === "1 bonus action"
				? " bonus"
				: spell.cast_time === "Modifier" ||
					spell.cast_time === "1 reaction"
					? " bonus modifier"
					: "";
		if (spell.consumable) className += " red";

		// damage modifier for consumables
		if (spell.dice) {
			spell.damage = spell.dice.roll;
			if (spell.consumable && spell.dice.add_modifier) {
				spell.damage += "+ spell modifier";
			}
		}

		var desc = (
			<div className="roll-values pin-bottom">
				{spell.shortDesc
					? <p className="shortDesc">
							{spell.shortDesc}
						</p>
					: null}
				{spell.save && spell.save.throw
					? <WriteIn
							label="Save"
							save={spell.save.throw}
							writein={false}
						/>
					: ""}
				{spell.save.success
					? <div className="save-success">
							{spell.save.success}
						</div>
					: null}
				{spell.dice && spell.dice.attack
					? <WriteIn 
						label="Attack" 
						dmgType={spell.dice.attack}
						writein={true} />
					: null}
				{spell.dice && spell.dice.roll && spell.dice.type !== "Healing"
					? <WriteIn
							label={spell.dice.type === "Effect" ? "Roll" : "Damage"}
							dice={spell.dice.roll}
							dmgType={spell.dice.type === "Effect" ? null : spell.dice.type}
							writein={spell.dice.add_modifier && !spell.consumable}
							progression={spell.dice.progression}
							level={ spell.dice.roll === true ? 0 : spell.level}
						/>
					: null}
				{spell.dice && spell.dice.type === "Healing"
					? <WriteIn
							label="Heal"
							dice={spell.dice.roll}
							writein={spell.dice.add_modifier && !spell.consumable}
						/>
					: null}
				{spell.dice && spell.dice.progression && spell.level !== 0 && (typeof spell.dice.progression === "string")
					? <WriteIn
							className="higherLevelDmg"
							label="&emsp;↑ Levels"
							dice={
								"+" + spell.dice.progression + " per slot level"
							}
							writein={false}
						/>
					: null}
			</div>
		);

		return (
			<div className={"card spell " + className}>
				<div className="card-inner front">
					<h1>
						{spell.namegen}{" "}
						{spell.ritual ? <i className="i-ritual" /> : ""}
						<p className="shortDesc">{spell.subtitle}</p>
					</h1>

					<i
						className={
							spell.icon ? "img gi gi-" + spell.icon : "hidden"
						}
					/>
					<div
						className={
							spell.icon || spell.isFeature === true
								? "lvl hidden"
								: "lvl"
						}
					>
						{SPELL_LVL_ICONS[spell.level]}
					</div>
					{desc}
				</div>
			</div>
		);
	}
}

class InfoPanel extends React.Component {
	render() {
		return (
			<div className="info-panel">
				<i
					className={
						"fa fa-long-arrow-up " +
						(this.props.range ? "" : "hidden")
					}
				/>{" "}
				{this.props.range}
				{this.props.range ? <span>&nbsp; &nbsp;</span> : ""}
				<i
					className={
						"fa fa-clock-o " + (this.props.duration ? "" : "hidden")
					}
				/>{" "}
				{this.props.duration}
				{this.props.concentration === "Yes" ? " Concentration" : ""}
			</div>
		);
	}
}

class SpellBack extends React.Component {
	render() {
		var spell = this.props.spell;
		var className = parseInt(spell.level, 10) > 0 ? " purple" : "";
		let desc = "";

		className +=
			spell.cast_time === "1 bonus action"
				? " bonus"
				: spell.cast_time === "Modifier" ||
					spell.cast_time === "1 reaction"
					? " bonus modifier"
					: "";
		if (spell.consumable) className += " red";
		if (spell.description && spell.description.map) {
			desc = spell.description.map((p, i) =>
				<p
					key={i}
					dangerouslySetInnerHTML={{
						__html: p.replace(
							"At Higher Levels",
							"<strong>At Higher Levels</strong>"
						)
					}}
				/>
			);
		}

		return (
			<div className={"card spell " + className}>
				<div className="card-inner back">
					<h2>
						{spell.namegen}
						{spell.ritual ? <i className="i-ritual" /> : ""}
						<span className="lvl">
							{spell.consumable || spell.isFeature
								? ""
								: SPELL_LVL_ICONS[spell.level]}
						</span>
					</h2>
					<div className="castTime">
						<em>
							{spell.cast_time}
						</em>
					</div>
					<InfoPanel
						range={spell.range}
						duration={spell.duration}
						concentration={spell.concentration}
					/>
					<div className="desc">
						{desc}
					</div>
					<div className="pin-bottom">
						<strong>
							{spell.components.types.replace("M", "").trim()}
						</strong>{" "}
						<span className="material">{spell.components.materials}</span>
						<span className="school">{spell.school}</span>
					</div>
				</div>
			</div>
		);
	}
}

class Page extends React.Component {
	renderFrontBack() {
		var side = this.props.side;
		var len = this.props.cards.length;
		this.props.cards.length = 9;
		this.props.cards.fill(false, len, 9);
		if (side === "back") {
			var c1 = this.props.cards.splice(0, 1, this.props.cards[2]);
			var c4 = this.props.cards.splice(3, 1, this.props.cards[5]);
			var c7 = this.props.cards.splice(6, 1, this.props.cards[8]);
			this.props.cards.splice(2, 1, c1[0]);
			this.props.cards.splice(5, 1, c4[0]);
			this.props.cards.splice(8, 1, c7[0]);
		}
		var cards = this.props.cards.map(function(card, index) {
			if (!card) return <div className="card blank" key={index} />;
			if (card.category === "Items") {
				if (side === "front")
					return <ItemFront item={card} key={index} />;
				if (side === "back")
					return <ItemBack item={card} key={index} />;
			}
			if (card.category === "Spells") {
				if (side === "front")
					return <SpellFront spell={card} key={index} />;
				if (side === "back")
					return <SpellBack spell={card} key={index} />;
			}
			return <span key={index} />;
		});
		return (
			<div className="paper landscape">
				{cards}
			</div>
		);
	}
	render() {
		var cards = [];
		this.props.cards.forEach(function(card, index) {
			if (!card) return <div className="card blank" key={index} />;
			else if (card.category === "Spells") {
				cards.push(
					<div className="card-wrap" key={index}>
						<SpellFront spell={card} />
						<SpellBack spell={card} />
						<br />
					</div>
				);
			} else if (card.category === "Items") {
				cards.push(
					<div className="card-wrap" key={index}>
						<ItemFront item={card} />
						<ItemBack item={card} />
						<br />
					</div>
				);
			}
		});
		return (
			<div className="paper  landscape">
				<div className="cardsName">{this.props.name}</div>	
				{cards}
			</div>
		);
	}
}
