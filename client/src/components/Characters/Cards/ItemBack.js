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
		item.type = MARTIAL_WEAPONS.includes(item.name)
			? "martial"
			: item.consumable ? "consumable" : "simple";

		return <Back {...item} />;
	}
}

const Back = ({ consumable, charges, name, cast_time, range, duration, concentration, props, weight, item_type, type }) => (
	<div className={"card weapon" + (consumable ? " red" : charges ? " purple": "")}>
		<div className="card-inner">
			<h2>
				{name}
			</h2>
			<div className="castTime">
				<em>
					{cast_time
						? cast_time
						: "1 action"}
				</em>
			</div>
			<InfoPanel
				range={range}
				duration={duration}
				concentration={concentration}
			/>
			<div className="desc">
				<p className={item_type === "Wand" ? "hidden": ""}>
					<strong>
						{item_type}
					</strong>
				</p>
				{props}
			</div>
			<div className="pin-bottom">
				{weight ? weight+" lb." : ""} 
				<span>{type}</span>
			</div>
		</div>
	</div>
)