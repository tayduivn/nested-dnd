import React from "react";

import InfoPanel from "./InfoPanel";
import { MARTIAL_WEAPONS } from "./CardsUtil";

export default class ItemBack extends React.Component {
	/**
	 * @prop {Card} item
	 */
	render() {
		var item = this.props.item;
		var props = [];

		// for potions of healing and special consumables
		if (item.description && !item.properties.length) {
			item.description.forEach(function(desc, index) {
				props.push(<p key={"desc" + index}>{desc}</p>);
			});
		}
		if (item.properties) {
			item.properties.forEach(function(prop, index) {
				if (prop.name === "Range") return;
				props.push(
					<p key={"prop" + index}>
						<strong>{prop.name}</strong> {prop.description}
					</p>
				);
			});
		}

		//todo: simple weapon list
		item.type = MARTIAL_WEAPONS.includes(item.name)
			? "martial"
			: item.consumable
				? "consumable"
				: "simple";

		return <Back {...item} props={props} />;
	}
}

const Back = ({
	consumable,
	charges,
	name,
	castTime = "1 action",
	range,
	longRange,
	duration,
	concentration,
	props,
	weight,
	itemType,
	type
}) => (
	<div
		className={"card weapon" + (consumable ? " red" : charges ? " purple" : "")}
	>
		<div className="card-inner">
			<h2>{name}</h2>
			<div className="castTime">
				<em>{castTime}</em>
			</div>
			<InfoPanel
				range={range}
				longRange={longRange}
				duration={duration}
				concentration={concentration}
			/>
			<div className="desc">
				<p className={itemType === "Wand" ? "hidden" : ""}>
					<strong>{itemType}</strong>
				</p>
				{props}
			</div>
			<div className="pin-bottom">
				{weight ? weight + " lb." : ""}
				<span className="right">{type}</span>
			</div>
		</div>
	</div>
);
