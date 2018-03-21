import React from "react";

import WriteIn from './WriteIn';

export default class ItemFront extends React.Component {
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