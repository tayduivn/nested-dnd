import React from "react";

import { Toggle } from "../Form";
import EditTableRows from "./EditTableRows";

const ReturnOption = ({ returns, handleChange, type = "" }) => (
	<label className={"form-check btn btn-secondary" + (returns === type ? " active" : "")}>
		<input
			className="form-check-input"
			type="radio"
			name="returns"
			id="returns"
			value={type}
			checked={returns === type}
			onChange={e => handleChange({ returns: e.target.value })}
		/>
		<span className="form-check-label">{type}</span>
	</label>
);

const Returns = props => (
	<div className="form-group">
		<label className="mr-2">Returns</label>
		<div className="btn-group">
			<ReturnOption {...props} type="generator" />
			<ReturnOption {...props} type="text" />
			<ReturnOption {...props} type="fng" />
		</div>
	</div>
);

const BulkAdd = ({ handleBulkAdd, bulkAddText, handleChange }) => (
	<div>
		<label className="mr-1">Bulk Add</label>
		<button className="btn btn-primary" onClick={handleBulkAdd}>
			Bulk Add
		</button>
		<textarea
			className="form-control"
			value={bulkAddText}
			placeholder="Insert 1 row per line"
			onChange={e => handleChange("bulkAddText", e.target.value)}
		/>
	</div>
);

const DisplayForm = ({
	_id,
	desc,
	returns = "text",
	rows = [],
	roll,
	tables = [],
	concat,
	rowWeights,
	public: isPublic,
	source = {},
	handleChange,
	totalWeight,
	handleDelete,
	generators,
	isEmbedded,
	location,
	handleBulkAdd,
	bulkAddText
}) => (
	<div>
		{!isEmbedded ? <Returns {...{ returns, handleChange }} /> : null}

		{/* --------- Concatenate ------------ */}
		<div className="form-group">
			<Toggle checked={concat} name="concat" handleChange={handleChange}>
				<strong> Combine Rows:</strong> The rows will combine together (instead of returning 1
				random row).
			</Toggle>
		</div>

		{/* --------- Capitalize First ------------ */}
		{returns === "fng" ? (
			<div className="form-group">
				<label>
					<input
						type="checkbox"
						checked={rows[3] && rows[3].value}
						name="capitalize"
						onChange={e => handleChange(["rows", 3, "value"], e.target.checked)}
					/>
					<strong> Capitalize:</strong> The first letter of the result will always be capitalized.
				</label>
			</div>
		) : null}

		<EditTableRows {...{ returns, handleChange, rows, concat, generators, tables, _id }} />

		{!concat ? <div>Weights Total = {totalWeight}</div> : null}

		{/* --------- Source ------------ */}
		{returns !== "fng" ? (
			<div className="form-group">
				<label>Source URL</label>
				<input
					value={source.url}
					name="source"
					className="form-control"
					onChange={e => handleChange(["source", "url"], e.target.value)}
				/>
			</div>
		) : null}

		{isEmbedded ? null : (
			<div>
				Roll: {typeof roll === "string" ? roll : roll && roll.toString ? roll.toString() : null}
			</div>
		)}

		{returns === "text" ? <BulkAdd {...{ handleBulkAdd, bulkAddText, handleChange }} /> : null}

		<div className="btn btn-danger" onClick={handleDelete}>
			Delete
		</div>
	</div>
);

const EditTableDisplay = ({ isCreate, handleCreate = () => {}, title = "", id, ...rest }) => (
	<div className="form" key={id}>
		{isCreate ? (
			<button className="btn btn-primary" onClick={() => handleCreate(title)}>
				Create
			</button>
		) : (
			<DisplayForm id={id} title={title} {...rest} />
		)}
	</div>
);

export default EditTableDisplay;
