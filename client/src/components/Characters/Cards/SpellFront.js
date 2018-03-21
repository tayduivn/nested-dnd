import React from "react";

import WriteIn from './WriteIn';
import { SPELL_LVL_ICONS } from './CardsUtil';

/* TODO: where was this used?
// damage modifier for consumables
	if (spell.dice) {
		spell.damage = spell.dice.roll;
		if (spell.consumable && spell.dice.add_modifier) {
			spell.damage += "+ spell modifier";
		}
	}
 */

const Desc = ({shortDesc, save, dice, consumable, level}) => (
	<div className="roll-values pin-bottom">
		{shortDesc
			? <p className="shortDesc">
					{shortDesc}
				</p>
			: null}
		{save && save.throw
			? <WriteIn
					label="Save"
					save={save.throw}
					writein={false}
				/>
			: ""}
		{save.success
			? <div className="save-success">
					{save.success}
				</div>
			: null}
		{dice && dice.attack
			? <WriteIn 
				label="Attack" 
				dmgType={dice.attack}
				writein={true} />
			: null}
		{dice && dice.roll && dice.type !== "Healing"
			? <WriteIn
					label={dice.type === "Effect" ? "Roll" : "Damage"}
					dice={dice.roll}
					dmgType={dice.type === "Effect" ? null : dice.type}
					writein={dice.add_modifier && !consumable}
					progression={dice.progression}
					level={ dice.roll === true ? 0 : level}
				/>
			: null}
		{dice && dice.type === "Healing"
			? <WriteIn
					label="Heal"
					dice={dice.roll}
					writein={dice.add_modifier && !consumable}
				/>
			: null}
		{dice && dice.progression && level !== 0 && (typeof dice.progression === "string")
			? <WriteIn
					className="higherLevelDmg"
					label="&emsp;↑ Levels"
					dice={
						"+" + dice.progression + " per slot level"
					}
					writein={false}
				/>
			: null}
	</div>
);

function getClassName(spell){
	var className = parseInt(spell.level, 10) > 0 ? " purple" : "";
	className +=
		spell.cast_time === "1 bonus action"
			? " bonus"
			: spell.cast_time === "Modifier" ||
				spell.cast_time === "1 reaction"
				? " bonus modifier"
				: "";
	if (spell.consumable) className += " red";
	return className
}

const SpellFront = ({spell}) => (
	<div className={"card spell " + getClassName(spell)}>
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
			<Desc {...spell} />
		</div>
	</div>
);

export default SpellFront;