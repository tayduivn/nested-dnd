import React from "react";

import { getDamageTypeIcon, getDamageTypeName } from './CardsUtil';

export default class WriteIn extends React.Component {
	render() {
		let writein = (
			<div className="write-in">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
		);

		let damageDice = false;
		if (this.props.progression && this.props.level === 0) {
			damageDice = writein;
		} else if (
			this.props.dice &&
			this.props.dice.includes &&
			this.props.dice.includes("0.49")
		) {
			damageDice = (
				<p>
					{this.props.dice
						.replace("0.49", "1")
						.replace("level", "2 levels")}
				</p>
			);
		} else if (
			this.props.dice &&
			(!this.props.progression || this.props.level > 0)
		) {
			damageDice = (
				<p>
					{this.props.dice}
				</p>
			);
		}

		return (
			<div className={this.props.className}>
				<label>
					{this.props.label}
				</label>
				{damageDice}
				{this.props.writein ? writein : ""}
				<p className="damageType">
					<i className={getDamageTypeIcon(this.props.dmgType)} />{" "}
					{getDamageTypeName(this.props.dmgType)}
				</p>
				<p>
					{this.props.save}
				</p>
			</div>
		);
	}
}
