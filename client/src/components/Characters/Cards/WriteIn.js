import React from "react";

import { getDamageTypeIcon, getDamageTypeName } from './CardsUtil';


const WRITEIN = (
	<div className="write-in">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
);

const DamageDice = ({dice}) => (
	<p>
		{dice.replace("0.49", "1").replace("level", "2 levels")}
	</p>
);

const WriteIn = ({level, dice, progression, className, label, writein, dmgType, save}) => (
	<div className={className}>
		<label>
			{label}
		</label>
		{processDice(dice, progression, level)}
		{writein ? writein : ""}
		<p className="damageType">
			<i className={getDamageTypeIcon(dmgType)} />{" "}
			{getDamageTypeName(dmgType)}
		</p>
		<p>
			{save}
		</p>
	</div>
)

function processDice(dice, progression, level){
	let damageDice = false;
	if (progression && level === 0) {
		damageDice = WRITEIN;
	}
	else if (typeof dice === 'string' && dice.includes("0.49")) {
		damageDice = <DamageDice dice={dice} />;
	} 
	else if (dice && (!progression || level > 0)) {
		damageDice = <p>{dice}</p>;
	}
	return damageDice;
}

export default WriteIn;