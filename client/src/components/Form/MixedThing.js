import React from "react";
import ReactSortable from "react-sortablejs";

import Value from "./MixedThingValue";
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
		toString: () => "[generator]"
	},
	string: {
		label: "text",
		toString: val => '"' + val + '"'
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
		const { hasKey, deleteOne, property, isTextarea } = options;

		return (
			<div className="row">
				{options.sortable ? DRAGGER : null}

				{options.hasKey ? (
					<Key {...{ handleChange: this.props.handleChange, label, map, property }} />
				) : null}

				<TypeChoose
					options={options.types.join(",")}
					type={typeof value === "object" && (!type || type === "string") ? "json" : type}
					{...{ handleChange }}
					property="type"
				/>

				<div className="col">
					<Value
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

class MixedKeyValue extends React.PureComponent {
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

class MixedSortable extends React.Component {
	shouldComponentUpdate(nextProps) {
		const changedArray = JSON.stringify(this.props.array) !== JSON.stringify(nextProps.array);
		return changedArray;
	}
	handleSort = (order, sortable, { oldIndex, newIndex }) => {
		const arr = [...this.props.array];

		// do sort
		const temp = arr[newIndex];
		arr[newIndex] = arr[oldIndex];
		arr[oldIndex] = temp;
		this.props.handleChange({
			[this.props.options.property]: arr
		});
	};
	handleChange = changed => {
		const arr = [...this.props.array];
		let index;
		for (index in changed) {
			let newRow = changed[index];
			if (!newRow) {
				arr.splice(index, 1);
			} else arr[index] = newRow;
		}
		this.props.handleChange({ [this.props.options.property]: arr });
	};
	render() {
		const { options = {}, array = [], ...rest } = this.props;
		return (
			<ul className="p-0">
				<ReactSortable options={{ handle: ".handle" }} onChange={this.handleSort}>
					{array &&
						array.map &&
						array.map((c = {}, i) => (
							<MixedThing
								options={{ ...options, sortable: true, property: i }}
								{...c}
								key={(c && c._id) || Math.random()}
								{...{ i, array, ...rest }}
								handleChange={this.handleChange}
							/>
						))}
				</ReactSortable>
			</ul>
		);
	}
}

export default MixedThing;
export { MixedKeyValue, MixedSortable };
