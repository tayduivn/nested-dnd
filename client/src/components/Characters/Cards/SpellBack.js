import React from "react";

import InfoPanel from './InfoPanel';
import { SPELL_LVL_ICONS } from './CardsUtil';

export default class SpellBack extends React.Component {
	render() {
		var spell = this.props.spell;
		var className = parseInt(spell.level, 10) > 0 ? " purple" : "";
		let desc = "";

		className +=
			spell.cast_time === "1 bonus action"
				? " bonus"
				: spell.cast_time === "Modifier" ||
					spell.cast_time === "1 reaction"
					? " bonus modifier"
					: "";
		if (spell.consumable) className += " red";
		if (spell.description && spell.description.map) {
			desc = spell.description.map((p, i) =>
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

		return (
			<div className={"card spell " + className}>
				<div className="card-inner back">
					<h2>
						{spell.namegen}
						{spell.ritual ? <i className="i-ritual" /> : ""}
						<span className="lvl">
							{spell.consumable || spell.isFeature
								? ""
								: SPELL_LVL_ICONS[spell.level]}
						</span>
					</h2>
					<div className="castTime">
						<em>
							{spell.cast_time}
						</em>
					</div>
					<InfoPanel
						range={spell.range}
						duration={spell.duration}
						concentration={spell.concentration}
					/>
					<div className="desc">
						{desc}
					</div>
					<div className="pin-bottom">
						<strong>
							{spell.components.types.replace("M", "").trim()}
						</strong>{" "}
						<span className="material">{spell.components.materials}</span>
						<span className="school">{spell.school}</span>
					</div>
				</div>
			</div>
		);
	}
}
