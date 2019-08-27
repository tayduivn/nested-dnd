import React from "react";

import { Dropdown, MixedThing } from "../Form";

import fngArrayOptions, { wrapOption } from "util/fngArrayOptions";

const FNG = ({ handleChange, rows }) => (
	<div>
		<Dropdown
			value={wrapOption(rows[0] && rows[0].value, rows[1] && rows[1].value)}
			onChange={({ value }) => {
				handleChange(["rows", 0, "value"], value[0]);
				handleChange(["rows", 1, "value"], value[1]);
			}}
			options={fngArrayOptions}
		/>
		<select
			className="form-control"
			value={rows[2] && rows[2].value}
			onChange={e => handleChange(["rows", 2, "value"], e.target.value)}
		>
			<option />
			<option value="0">Male</option>
			<option value="1">Female</option>
		</select>
	</div>
);

const NotFNG = ({
	type,
	value,
	weight,
	returns,
	concat,
	handleChange,
	generators,
	tables,
	rows,
	i,
	_id
}) => (
	<MixedThing
		options={{
			types:
				returns === "generator"
					? ["generator", "embed", "table_id", "table", "data"]
					: ["string", "table_id", "table", "data", "dice"],
			property: i,
			showWeight: !concat,
			isTextarea: true
		}}
		{...{ handleChange, value, generators, weight, i, _id }}
		tables={
			returns === "generator"
				? tables.filter(t => t.returns === "generator" && t._id !== _id)
				: tables.filter(t => t.returns !== "generator" && t._id !== _id)
		}
		array={rows}
		type={returns === "generator" && (!type || type === "string") ? "generator" : type}
	/>
);

export default class EditTableRows extends React.Component {
	constructor(props) {
		super(props);
		this.addRow = this.addRow.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}
	addRow() {
		this.handleChange({ [this.props.rows.length || 0]: { type: "string" } });
	}
	handleChange(data) {
		// replace "undefined" with "null" so something is sent to the server
		// TODO: investigate if we can modify the MixedThing behavior so it hands back a null
		// eslint-disable-next-line
		for (let index in data) {
			if (!data[index]) data[index] = null;
		}
		this.props.handleChange({ rows: data });
	}
	render() {
		const { returns, rows, concat, generators, tables, _id } = this.props;
		const { handleChange } = this;
		return (
			<div className="form-group">
				<label>Rows</label>
				<ul className="p-0">
					{returns === "fng" ? (
						<FNG {...{ handleChange, rows }} />
					) : !rows.map ? null : (
						rows.map((c = {}, i) => (
							<NotFNG
								key={i}
								{...c}
								{...{
									returns,
									concat,
									handleChange,
									generators,
									tables,
									rows,
									_id,
									i
								}}
							/>
						))
					)}
				</ul>
				<button className="btn btn-primary" onClick={this.addRow}>
					<i className="fas fa-plus" /> Add
				</button>
			</div>
		);
	}
}
