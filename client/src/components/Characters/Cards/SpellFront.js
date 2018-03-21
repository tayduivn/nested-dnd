import React from "react";

import WriteIn from './WriteIn';
import { SPELL_LVL_ICONS } from './CardsUtil';

export default class SpellFront extends React.Component {
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