import React from "react";

import InfoPanel from './InfoPanel';
import { SPELL_LVL_ICONS } from './CardsUtil';

function getClassName(level, cast_time, consumable){
	var className = parseInt(level, 10) > 0 ? " purple" : "";
	className += cast_time === "1 bonus action"
				? " bonus"
				: cast_time === "Modifier" ||
					cast_time === "1 reaction"
					? " bonus modifier"
					: "";
		if (consumable) className += " red";
	return className;
}

function getDesc(description){
	let desc = "";
	if (description && description.map) {
		desc = description.map((p, i) =>
			<p
				key={i}
				dangerouslySetInnerHTML={{
					__html: p.replace(
						"At Higher Levels",
						"<strong>At Higher Levels</strong>"
					)
				}}
			/>
		);
	}
	return desc;
}

const SpellBack = ({description, namegen, ritual, consumable, isFeature, level, cast_time, range, duration, concentration, components, school}) => (
	<div className={"card spell " + getClassName(level, cast_time, consumable)}>
		<div className="card-inner back">
			<h2>
				{namegen}
				{ritual ? <i className="i-ritual" /> : ""}
				<span className="lvl">
					{consumable || isFeature
						? ""
						: SPELL_LVL_ICONS[level]}
				</span>
			</h2>
			<div className="castTime">
				<em>
					{cast_time}
				</em>
			</div>
			<InfoPanel
				range={range}
				duration={duration}
				concentration={concentration}
			/>
			<div className="desc">
				{getDesc(description)}
			</div>
			<div className="pin-bottom">
				<strong>
					{components.types.replace("M", "").trim()}
				</strong>{" "}
				<span className="material">{components.materials}</span>
				<span className="school">{school}</span>
			</div>
		</div>
	</div>
)

export default SpellBack;