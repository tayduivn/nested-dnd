import React from "react";
import PropTypes from "prop-types";

import MixedThingValue from "./MixedThingValue";
import MixedThingMods from "./MixedThingMods";

export const TYPE = {
	generator: {
		value: "generator",
		toString: (id, { generators }) => {
			for (var isa in generators) {
				if (generators[isa].id === id) return isa;
			}
			return "generator";
		}
	},
	embed: {
		label: "generator (embedded)",
		toString: val => (val && `${TYPE[val.name.type].toString(val.name.value)}`) || "[generator]"
	},
	string: {
		label: "text",
		toString: val => val
	},
	table_id: {
		label: "table",
		toString: (id, { tables }) => {
			for (var i = 0; i < tables.length; i++) {
				var t = tables[i];
				if (t._id === id) return "[" + t.title + "]" || "☰";
			}
			return "table";
		}
	},
	table: {
		label: "table (embedded)",
		toString: () => "☰"
	},
	data: {
		label: "data",
		toString: id => "[data: " + id + "]"
	},
	json: {
		label: "json",
		toString: obj => JSON.stringify(obj)
	},
	dice: {
		label: "dice",
		toString: v => v
	}
};

class TypeChoose extends React.PureComponent {
	handleChange = e => {
		this.props.handleChange({ [this.props.property]: e.target.value });
	};
	render() {
		const { type = "string", options = "" } = this.props;
		return (
			<div className="col-auto">
				<select className="form-control" value={type} onChange={this.handleChange}>
					{options.split(",").map((o, i) => {
						const type = TYPE[o] || {};
						return (
							<option key={i} value={o || type.label}>
								{type.label || o}
							</option>
						);
					})}
				</select>
			</div>
		);
	}
}

const DRAGGER = (
	<div className="col-auto">
		<div className="handle btn btn-light btn-sm">
			<i className="fas fa-arrows-alt" />
		</div>
	</div>
);

class Key extends React.PureComponent {
	handleChange = e => {
		var d = { ...this.props.map };
		d[e.target.value] = d[this.props.label];
		d[this.props.label] = undefined;
		this.props.handleChange(d);
	};
	render() {
		const { label } = this.props;
		return (
			<div className="col-auto">
				<input
					data-lpignore="true"
					className="form-control"
					placeholder="id"
					value={label}
					onChange={this.handleChange}
				/>
			</div>
		);
	}
}

class Delete extends React.PureComponent {
	deleteOne = () => {
		this.props.handleChange("name", null);
	};
	deleteKey = () => {
		this.props.handleChange(undefined);
	};
	deleteIndex = () => {
		this.props.handleChange(undefined);
	};
	render() {
		const { i, hasKey, deleteOne } = this.props;
		const deleteFunc =
			i !== undefined ? this.deleteIndex : hasKey ? this.deleteKey : this.deleteOne;
		return (
			<div className="col-auto">
				{i !== undefined ? (
					<button className="btn btn-danger" onClick={deleteFunc}>
						<i className="far fa-trash-alt" />
					</button>
				) : null}
				{hasKey ? (
					<button className="btn btn-danger" onClick={deleteFunc}>
						<i className="far fa-trash-alt" />
					</button>
				) : null}
				{deleteOne ? (
					<button className="btn btn-danger" onClick={deleteFunc}>
						<i className="far fa-trash-alt" />
					</button>
				) : null}
			</div>
		);
	}
}

class MixedThing extends React.PureComponent {
	static propTypes = {
		options: PropTypes.object,
		i: PropTypes.number,
		_id: PropTypes.string
	};
	handleChange = changed => {
		// deleting
		if (!changed) {
			return this.props.handleChange({
				[this.props.options.property]: changed
			});
		}
		// editing
		this.props.handleChange({
			[this.props.options.property]: {
				_id: this.props._id,
				type: this.props.type,
				value: this.props.value,
				...changed
			}
		});
	};
	render() {
		const { options = {}, i, label, map } = this.props;
		const { weight, array, amount: { min = 1, max = 1 } = {}, chance, ...rest } = this.props;
		const { type, value, tables } = this.props;
		const { handleChange } = this;
		const { hasKey, deleteOne, isTextarea } = options;

		return (
			<div className="row">
				{options.sortable ? DRAGGER : null}

				{options.hasKey ? <Key {...{ handleChange: this.props.handleChange, label, map }} /> : null}

				<TypeChoose
					options={options.types.join(",")}
					type={typeof value === "object" && (!type || type === "string") ? "json" : type}
					{...{ handleChange }}
					property="type"
				/>

				<div className="col">
					<MixedThingValue
						{...{ ...rest, type, tables, value, i, handleChange, property: "value", isTextarea }}
					/>
				</div>

				<MixedThingMods
					{...{ ...options, min, max, weight, chance, handleChange, types: undefined }}
				/>

				<Delete {...{ i, array, handleChange, map, label, hasKey, deleteOne }} />
			</div>
		);
	}
}

export default MixedThing;
