import React from "react";

import InfoPanel from './InfoPanel';
import { PROP_DESC, MARTIAL_WEAPONS } from './CardsUtil';

export default class ItemBack extends React.Component {
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