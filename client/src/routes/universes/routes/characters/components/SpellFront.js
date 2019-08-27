import React from "react";

import WriteIn from "./WriteIn";
import { SPELL_LVL_ICONS } from "../util/cardsUtil";
import Icon from "components/Icon";

/* TODO: where was this used?
// damage modifier for consumables
	if (spell.dice) {
		spell.damage = spell.dice.roll;
		if (spell.consumable && spell.dice.add_modifier) {
			spell.damage += "+ spell modifier";
		}
	}
 */

const Desc = ({
	shortDesc,
	saveData: save = {},
	damage = {},
	range,
	healing,
	consumable,
	level,
	uses
}) => (
	<div className="roll-values pin-bottom">
		{shortDesc ? <p className="shortDesc">{shortDesc}</p> : null}
		{save && save.throw ? <WriteIn label="Save" save={save.throw} writein={false} /> : ""}
		{save.success ? <div className="save-success">{save.success}</div> : null}
		{damage.attack ? <WriteIn label="Attack" dmgType={damage.attack} writein={true} /> : null}
		{damage.diceString ? (
			<WriteIn
				label={damage.type === "Effect" ? "Roll" : "Damage"}
				dice={damage.diceString}
				dmgType={damage.type === "Effect" ? null : damage.type}
				writein={damage.addModifier && !consumable}
				progression={damage.progression}
				level={damage.roll === true ? 0 : level}
			/>
		) : null}
		{healing ? (
			<WriteIn
				label="Heal"
				dice={healing.diceString}
				writein={healing.addModifier && !consumable}
			/>
		) : null}
		{damage.progression && level !== 0 && typeof damage.progression === "string" ? (
			<WriteIn
				className="higherLevelDmg"
				label="&emsp;↑ Levels"
				dice={"+" + damage.progression + " per slot level"}
				writein={false}
			/>
		) : null}
		{uses && uses.reset ? (
			<div>
				<WriteIn label="Uses reset" dice={uses.reset} />
			</div>
		) : null}
	</div>
);

function getClassName(level, castTime, uses, consumable) {
	var className = parseInt(level, 10) > 0 || (uses && uses.count) ? " purple" : "";
	className +=
		castTime === "1 bonus action"
			? " bonus"
			: castTime === "Modifier" || castTime === "1 reaction"
			? " bonus modifier"
			: "";
	if (consumable) className += " red";
	return className;
}

const SpellFront = ({ name, ritual, subtitle, icon, isFeature, level, ...rest }) => (
	<div className={"card spell " + getClassName(level, rest.castTime, rest.uses, rest.consumable)}>
		<div className="card-inner front">
			<h1>
				{name} {ritual ? <i className="i-ritual" /> : ""}
				<p className="shortDesc">{subtitle}</p>
			</h1>

			<Icon name={icon + " img"} />
			<div className={icon || isFeature === true ? "lvl hidden" : "lvl"}>
				{SPELL_LVL_ICONS[level]}
			</div>
			<Desc {...rest} />
		</div>
	</div>
);

export default SpellFront;
export { getClassName };
