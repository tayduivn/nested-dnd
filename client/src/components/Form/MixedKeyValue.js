import React from "react";

import MixedThing from "./MixedThing";

class MixedKeyValueItem extends React.PureComponent {
	handleChange = val => {
		this.props.handleChange({ [this.props.options.property]: val });
	};
	render() {
		const { map, k, options, rest, handleChange } = this.props;
		if (map[k] === undefined) return null;
		var { type, value } = map[k];

		//not properly stored, clean data
		if (type === undefined && value === undefined) {
			value = map[k];
			type = typeof value === "object" ? (value instanceof Array ? "table" : "json") : "string";
			if (type === "table") value = { rows: value.map(v => ({ value: v })) };
		}
		return (
			<MixedThing
				label={k}
				options={{
					...options,
					property: k,
					hasKey: true,
					types: options.types
				}}
				{...{ handleChange, map, type, value }}
				{...rest}
			/>
		);
	}
}

export default class MixedKeyValue extends React.PureComponent {
	handleAdd = () => {
		this.props.handleChange({ "": "" });
	};
	render() {
		const { options = {}, map = {}, handleChange = () => {}, disabled, ...rest } = this.props;
		return (
			<React.Fragment>
				{Object.keys(map).length ? (
					<ul className="p-0">
						{Object.keys(map).map((k, i) => (
							<MixedKeyValueItem key={i} {...{ map, k, options, rest, handleChange }} />
						))}
					</ul>
				) : null}
				{map[""] === undefined && !disabled ? (
					<button className="btn btn-light btn-sm" onClick={this.handleAdd}>
						<i className="fas fa-plus" /> add
					</button>
				) : null}
			</React.Fragment>
		);
	}
}
