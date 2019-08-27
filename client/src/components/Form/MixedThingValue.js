import React from "react";
import PropTypes from "prop-types";
import debounce from "debounce";

import Link from "components/Link";
import Dropdown from "../Form/Dropdown";

import { TYPE } from "./MixedThing";

class String extends React.PureComponent {
	constructor(props) {
		super(props);
		this.pushChange = debounce(props.handleChange, 500);
	}
	handleChange = e => {
		const val = e.target.value;
		if (e.target.validity.valid) {
			if (this.props.property instanceof Array) {
				const changed = {};
				let prop = changed;
				this.props.property.forEach(p => {
					prop[p] = {};
					prop = prop[p];
				});
				this.pushChange(changed);
			} else this.pushChange({ [this.props.property]: val });
		}
	};
	render() {
		const { isTextarea, type, value } = this.props;
		if (isTextarea && type !== "dice") {
			return (
				<textarea
					data-lpignore="true"
					className="form-control"
					placeholder="value"
					onChange={this.handleChange}
					defaultValue={value || ""}
				/>
			);
		} else
			return (
				<input
					data-lpignore="true"
					className="form-control"
					placeholder="value"
					defaultValue={value || ""}
					onChange={this.handleChange}
				/>
			);
	}
}

class JsonInput extends React.PureComponent {
	handleChange = e => {
		this.props.handleChange({ [this.props.property]: e.target.value });
	};
	render() {
		let val = JSON.stringify(this.props.value, 2);
		return (
			<textarea
				data-lpignore="true"
				className="form-control"
				placeholder="value"
				onChange={this.handleChange}
				value={val}
			/>
		);
	}
}

class Table extends React.PureComponent {
	render() {
		let { value, tables, generators, property, setState } = this.props;
		var endUrl = window.location.href.split("/");
		endUrl = endUrl[endUrl.length - 1];
		var preview = "";

		if (!value) value = { rows: [] };
		else if (value.rows) {
			//make a preview
			preview = value.rows.map(r =>
				TYPE[r.type || "string"].toString(r.value, { tables, generators })
			);
			preview = value.concat ? preview.join("") : preview.join(" | ");
			if (preview.length > 100) preview = preview.substr(0, 100) + "...";
		}

		return (
			<Link
				to={{
					pathname: endUrl + "/" + property[0] + "/" + property[1],
					state: { table: value || {} }
				}}
				onClick={() => {
					if (setState) setState({ showEmbedded: value, embeddedPath: property });
				}}
			>
				({(value && value.rows && value.rows.length) || 0} rows): {preview}
			</Link>
		);
	}
}

function getEmbeddedUrl(property, i) {
	let endUrl = window.location.href.split("/");
	endUrl = endUrl[endUrl.length - 1];

	return endUrl + "/" + property + "/" + i;
}

const EmbeddedGenerator = ({ value, property, i }) => (
	<Link
		to={{
			pathname: getEmbeddedUrl(property, i),
			state: { generator: value || {}, index: i }
		}}
	>
		{TYPE.embed.toString(value)}
	</Link>
);

const TableId = ({ value, handleChange, property, tables }) => (
	<select
		className="form-control"
		value={value || ""}
		onChange={e => handleChange({ [property]: e.target.value })}
	>
		<option value={null} />
		{tables.map(t => (
			<option key={t._id} value={t._id}>
				{t.title}
			</option>
		))}
	</select>
);

export default class MixedThingValue extends React.PureComponent {
	static propTypes = {
		i: PropTypes.number
	};
	handleChangeIsa = ({ isa } = {}) => {
		this.props.handleChange({ [this.props.property]: isa });
	};
	_getIsaSelectVals() {
		return {
			options: Object.keys(this.props.generators).join(","),
			defaultValue: this.props.value || "",
			openOnFocus: true,
			optionHeight: 30,
			rows: 1,
			saveOnBlur: true,
			notFoundError: "Can't find generator",
			onChange: this.handleChangeIsa
		};
	}
	render() {
		const { property, type, value, tables = [], i } = this.props;
		const { generators = {}, handleChange, isTextarea, setState } = this.props;

		switch (
			type //'string','generator','table','embed','table_id'
		) {
			case "table_id":
				return <TableId {...{ value, handleChange, property, tables }} />;
			case "generator":
				return <Dropdown {...this._getIsaSelectVals()} />;
			case "table":
				return <Table {...{ value, tables, generators, property, setState }} />;
			case "json":
				return <JsonInput {...{ value, handleChange, property }} />;
			case "embed":
				return <EmbeddedGenerator {...{ value, property, i }} />;
			case "string":
			case "data":
			case "dice":
			default:
				return <String {...{ isTextarea, type, handleChange, property, value }} />;
		}
	}
}
