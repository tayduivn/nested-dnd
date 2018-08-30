import React from "react";

import WriteIn from './WriteIn';
import { Icon } from '../../Explore/ExplorePage'

const ItemFront = ({item}) => (
	<div className={"card weapon" + (item.consumable ? " red" : item.uses ? " purple": "")}>
		<div className="card-inner front">
			<h1>
				{item.name.trim().length
					? item.name
					: "________________"}
			</h1>
			<Icon name={item.icon+' img'} />
			{(item.damage || item.healing || item.uses || item.shortDesc || item.saveData) ? 
				<RollValues {...item} /> : <p />}
		</div>
	</div>
);
export default ItemFront;

const RollValues = ({shortDesc, uses, damage, attackType, healing, saveData, consumable, level}) => (
	<div className="roll-values pin-bottom">
		<p className="shortDesc">
			{shortDesc}
		</p>
		{uses
			? <div>
					<WriteIn
						label="Charges"
						dice={"❍".repeat(uses.count)}
					/>
					<WriteIn
						className="higherLevelDmg"
						label="&nbsp;&nbsp;&nbsp;&nbsp; Resets"
						dice={uses.reset}
					/>
				</div>
			: null}
		{attackType
			? <WriteIn
					label="Attack"
					dmgType={attackType}
					writein={true}
				/>
			: null}
		{saveData
			? <WriteIn
					label="Save"
					save={saveData.throw}
					writein={false}
				/>
			: null}
		
		{saveData && saveData.success
			? <div className="save-success">
					{(saveData.dc ? "DC"+saveData.dc+" " : "")+saveData.success}
				</div>
			: null}
		{damage 
			? <WriteIn
					label="Damage"
					dice={damage.diceString}
					dmgType={damage.damageType}
					writein={damage.addModifier === true}
				/>
			: ""}
		{healing
			? <WriteIn
					label="Heal"
					dice={healing.diceString}
					writein={
						healing.addModifier && !consumable
					}
				/>
			: null}
		{damage && damage.twoHandDice
			? <WriteIn
					label="&nbsp;&nbsp;2-hand"
					dice={damage.twoHandDice}
				/>
			: null}
		{damage && damage.progression && level !== 0  && (typeof damage.progression === "string")
		? <WriteIn
				className="higherLevelDmg"
				label={"	↑"+ (uses ? "Charges" : "Levels")}
				dice={
					"+" + damage.progression + " per "+(uses ? "charge" : "slot level")
				}
				writein={false}
			/>
		: null}
	</div>
)