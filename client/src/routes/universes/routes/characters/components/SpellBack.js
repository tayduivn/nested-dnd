import React from "react";

import InfoPanel from "./InfoPanel";
import { SPELL_LVL_ICONS } from "../util/cardsUtil";
import { getClassName } from "./SpellFront";

function getDesc(description) {
	let desc = "";
	if (description && description.map) {
		desc = description.map((p, i) => (
			<p
				key={i}
				dangerouslySetInnerHTML={{
					__html: p.replace(
						"At Higher Levels",
						"<strong>At Higher Levels</strong>"
					)
				}}
			/>
		));
	}
	return desc;
}

const SpellBack = ({
	description,
	name,
	ritual,
	consumable,
	isFeature,
	level,
	castTime,
	range,
	duration,
	concentration,
	components = {},
	school,
	uses
}) => (
	<div
		className={"card spell " + getClassName(level, castTime, uses, consumable)}
	>
		<div className="card-inner back">
			<h2>
				{name}
				{ritual ? <i className="i-ritual" /> : ""}
				<span className="lvl">
					{consumable || isFeature ? "" : SPELL_LVL_ICONS[level]}
				</span>
			</h2>
			<div className="castTime">
				<em>{castTime}</em>
			</div>
			<InfoPanel
				range={range}
				duration={duration}
				concentration={concentration}
			/>
			<div className="desc">{getDesc(description)}</div>
			<div className="pin-bottom">
				<strong>{components.types}</strong>{" "}
				<span className="material">{components.materials}</span>
				<span className="school">{school}</span>
			</div>
		</div>
	</div>
);

export default SpellBack;
