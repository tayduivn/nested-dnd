import React, { Component } from "react";


function getSpellSlots(slots = []) {
	return slots.map(function(slots, level) {
		if (!slots || slots === 0 || level === 0) {
			return <span key={level} />;
		}
		var circ = "❍".repeat(slots);
		return (
			<p key={level}>
				level {level} &nbsp;&nbsp;<span className="circles">{circ}</span>
			</p>
		);
	});
};

function renderDC(list){
	if(list.length !== 1)
		return <span></span>;
	return (
		<div id="dc" className="icon-container">
			<label>DC</label>
			<h1>
				{list[0].spellcasting.dc}
			</h1>
		</div>
	);
};

const SpellSlots = ({spellcasting}) => (
	<div>
		<p className="title">Spell Slots</p>
		{renderDC(spellcasting.list)}
		<div id="spell-slots">
			{getSpellSlots(spellcasting.getSlots())}
		</div>
	</div>
);

const Ki = ({dc, count}) => (
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

const SpellSlotsAndMoney = ({char, monk}) => (
	<div id="spellsAndMoney" className="pin-bottom">
		{ char.spellcasting.list.length ? <SpellSlots spellcasting={char.spellcasting} /> : null }
		{ ( (monk = char.getClass("Monk")) && monk.level >= 2) ? 
			<Ki count={monk.level} dc={8+char.getProficiencyBonus()+char.abilities.Wisdom.getMod()} /> : ""}
		<div id="money" className="row">
			<div className="col-xs-3">
				<label>platium</label>
			</div>
			<div className="col-xs-3">
				<label>galleon</label>
			</div>
			<div className="col-xs-3">
				<label>sickle</label>
			</div>
			<div className="col-xs-3">
				<label>knut</label>
			</div>
		</div>
	</div>
);

function spellbook(spellsByLevel, prepares, canCastUnpreppedRituals) {
	return spellsByLevel.map(function(spellArr, i) {
		spellArr = spellArr.map(function(spell, index) {
			return (
				<li key={"spell" + index}>
					{spell.getData().namegen}
					{spell.getData().ritual && canCastUnpreppedRituals
						? <i className="i-ritual" />
						: ""}{" "}
					{spell.note}
					{prepares && spell.prepared ? "●" : ""}
				</li>
			);
		});
		return (
			<ul key={"level" + i}>
				<li>
					<strong>
						Level {i}
					</strong>
				</li>{" "}
				{spellArr}
			</ul>
		);
	});
};

const Spells = ({prepares, spellcasting, title, numPrepared}) => (
	<div className="row push-top">
		<div className={`title-tag left ${prepares ? 6 : 8}`}>
			<p className="title">
				{title}
			</p>
			<label>
				{spellcasting.ritual_cast
					? <span>
							<i className="i-ritual" />Ritual Casting
						</span>
					: ""}
			</label>
		</div>
		<div className="col-2 title-tag">
			<p>
				{spellcasting.printAbility()}
			</p>
			<label>Ability</label>
		</div>
		<div className="col-2 title-tag">
			<p className="num">
				{spellcasting.dc}
			</p>
			<label>DC</label>
		</div>
		<div className={`col-2 title-tag ${prepares ? "" : "hidden"}`}>
			<p className="num">
				{numPrepared}
			</p>
			<label>Prep ●</label>
		</div>
		<div className="spellbook">
			{spellbook(
				spellcasting.spellsByLevel(),
				prepares,
				spellcasting.source === "Wizard"
			)}
		</div>
	</div>
);

export default Spells;
export { SpellSlotsAndMoney }