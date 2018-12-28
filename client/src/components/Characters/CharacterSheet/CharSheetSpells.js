import React from "react";

import { Icon } from "../../Explore/ExplorePage";

function getSpellSlots(slots = []) {
	return slots.map(function(slots, i) {
		var level = i + 1;

		if (!slots || slots === 0 || level === 0) {
			return null;
		}
		var circ = "❍".repeat(slots);
		return (
			<p key={level}>
				level {level} &nbsp;&nbsp;
				<span className="circles">{circ}</span>
			</p>
		);
	});
}

function renderDC(list) {
	if (list.length !== 1) return <span />;
	return (
		<div id="dc" className="icon-container">
			<label>DC</label>
			<h1>{list[0].dc}</h1>
		</div>
	);
}

function getSorcPoints(list) {
	var sorc = list.find(s => s.name === "Sorcerer");
	if (!sorc) return null;
	return (
		<p>
			Sorcery Points <span className="circles">{"❍".repeat(sorc.level)}</span>
		</p>
	);
}

const SpellSlots = ({ spellcasting }) => (
	<div>
		<p className="title">Spell Slots</p>
		{renderDC(spellcasting.list)}
		<div id="spell-slots">
			{getSorcPoints(spellcasting.list)}
			{getSpellSlots(spellcasting.slots)}
		</div>
	</div>
);

const Ki = ({ dc, count }) => (
	<div>
		<p className="title">Ki Points</p>
		<div id="dc" className="icon-container">
			<label>DC</label>
			<h1>{dc}</h1>
		</div>
		<div id="spell-slots">
			<span className="circles">{"❍".repeat(count)}</span>
		</div>
	</div>
);

const SpellSlotsAndMoney = ({
	spellcasting = { list: [] },
	proficiencyBonus,
	abilities = {},
	classes = [],
	monk
}) => (
	<div id="spellsAndMoney" className="pin-bottom">
		{spellcasting && spellcasting.list && spellcasting.list.length ? (
			<SpellSlots spellcasting={spellcasting} />
		) : null}
		{(monk = classes.find(c => c.name === "Monk")) && monk.level >= 2 ? (
			<Ki count={monk.level} dc={8 + proficiencyBonus + abilities.wis.mod} />
		) : (
			""
		)}
		<div id="money" className="row">
			<div className="col">
				<label>platium</label>
			</div>
			<div className="col">
				<label>galleon</label>
			</div>
			<div className="col">
				<label>sickle</label>
			</div>
			<div className="col">
				<label>knut</label>
			</div>
		</div>
	</div>
);

function spellbook(spellsByLevel = [], prepares, canCastUnpreppedRituals) {
	return spellsByLevel.map(function(spellArr, i) {
		spellArr = spellArr.map(function(spell = {}, index) {
			if (!spell) return null;
			return (
				<li key={"spell" + index}>
					{spell.name}
					{spell.ritual && canCastUnpreppedRituals ? (
						<Icon name="svg ritual" />
					) : (
						""
					)}{" "}
					{spell.note}
					{prepares && spell.prepared ? "●" : ""}
				</li>
			);
		});
		return (
			<ul key={"level" + i}>
				<li>
					<strong>Level {i}</strong>
				</li>{" "}
				{spellArr}
			</ul>
		);
	});
}

const Spells = ({
	name,
	prepares,
	ritualCast,
	printAbility,
	dc,
	spells,
	numPrepared
}) => (
	<div className="row push-top">
		<div className={`title-tag left col-${prepares ? 6 : 8}`}>
			<p className="title">{name + " Spells"}</p>
			<label>
				{ritualCast ? (
					<span>
						<Icon name="svg ritual" /> Ritual Casting
					</span>
				) : (
					""
				)}
			</label>
		</div>
		<div className="col-2 title-tag">
			<p>{printAbility}</p>
			<label>Ability</label>
		</div>
		<div className="col-2 title-tag">
			<p className="num">{dc}</p>
			<label>DC</label>
		</div>
		{prepares ? (
			<div className={`col-2 title-tag`}>
				<p className="num">{numPrepared}</p>
				<label>Prep ●</label>
			</div>
		) : null}
		<div className="spellbook">
			{spellbook(spells, prepares, name === "Wizard")}
		</div>
	</div>
);

export default Spells;
export { SpellSlotsAndMoney };
