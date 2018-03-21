import React from "react";

import WriteIn from './WriteIn';

const ItemFront = ({item}) => (
	<div className={"card weapon" + (item.consumable ? " red" : item.charges ? " purple": "")}>
		<div className="card-inner front">
			<h1>
				{item.name.trim().length
					? item.name
					: "________________"}
			</h1>
			<i className={"img gi gi-" + item.thing.getIcon()} />
			{(item.dice || item.charges || item.shortDesc || item.save) ? 
				<RollValues {...item} /> : <p />}
		</div>
	</div>
);
export default ItemFront;

const RollValues = ({shortDesc, charges, dice, item_type, save, consumable, level}) => (
	<div className="roll-values pin-bottom">
		<p className="shortDesc">
			{shortDesc}
		</p>
		{charges
			? <div>
					<WriteIn
						label="Charges"
						dice={"❍".repeat(charges.count)}
					/>
					<WriteIn
						className="higherLevelDmg"
						label="&nbsp;&nbsp;&nbsp;&nbsp; Regain Daily"
						dice={charges.daily_regain}
					/>
				</div>
			: ""}
		{dice && dice.attack
			? <WriteIn
					label="Attack"
					dice={dice.attack}
					dmgType={item_type.replace(" Weapon","")}
					writein={true}
				/>
			: ""}
		{save
			? <WriteIn
					label="Save"
					save={save.throw}
					writein={false}
				/>
			: ""}
		
		{save && save.success
			? <div className="save-success">
					{(save.dc ? "DC"+save.dc+" " : "")+save.success}
				</div>
			: ""}
			{dice && dice.roll && dice.type !== "Healing"
			? <WriteIn
					label="Damage"
					dice={dice ? dice.roll : ""}
					dmgType={dice.type}
					writein={dice.add_modifier === true}
				/>
			: ""}
		{dice && dice.type === "Healing"
			? <WriteIn
					label="Heal"
					dice={dice.roll}
					writein={
						dice.add_modifier && !consumable
					}
				/>
			: ""}
		{dice && dice.roll_2hand
			? <WriteIn
					label="&nbsp;&nbsp;2-hand"
					dice={dice.roll_2hand}
				/>
			: ""}
		{dice && dice.progression && level !== 0  && (typeof dice.progression === "string")
		? <WriteIn
				className="higherLevelDmg"
				label={"	↑"+ (charges ? "Charges" : "Levels")}
				dice={
					"+" + dice.progression + " per "+(charges ? "charge" : "slot level")
				}
				writein={false}
			/>
		: ""}
	</div>
)