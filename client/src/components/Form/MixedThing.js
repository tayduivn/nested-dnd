import React from "react";
import { Link } from "../Util";
import Sortable from "react-sortablejs";

import IsASelect from "../Form/IsASelect";

const TYPE = {
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

const TypeChoose = ({ type = "string", options, handleChange, property }) => (
	<div className="col-auto">
		<select
			className="form-control"
			value={type}
			onChange={e => handleChange(property, e.target.value)}
		>
			{options.map((o, i) => {
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

const Value = ({
	property,
	type,
	value,
	tables = [],
	generators = {},
	handleChange,
	location = "",
	isTextarea,
	setState
}) => {
	switch (
		type //'string','generator','table','embed','table_id'
	) {
		case "table_id":
			return (
				<select
					className="form-control"
					value={value || ""}
					onChange={e => handleChange(property, e.target.value)}
				>
					<option value={null} />
					{tables.map(t => (
						<option key={t._id} value={t._id}>
							{t.title}
						</option>
					))}
				</select>
			);
		case "generator":
			return (
				<IsASelect
					options={generators}
					defaultValue={{ label: value || "", value: value || "" }}
					openOnFocus={true}
					optionHeight={30}
					onChange={o => handleChange(property, o && o.value)}
				/>
			);
		case "table":
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
						state: { table: value }
					}}
					onClick={() => {
						if (setState)
							setState({ showEmbedded: value, embeddedPath: property });
					}}
				>
					({(value && value.rows && value.rows.length) || 0} rows): {preview}
				</Link>
			);
		case "json":
			value = JSON.stringify(value, 2);
			return (
				<textarea
					className="form-control"
					placeholder="value"
					onChange={e => handleChange(property, e.target.value)}
					value={value}
				/>
			);
		case "embed":
		case "string":
		case "data":
		case "dice":
		default:
			if (isTextarea && type !== "dice") {
				return (
					<textarea
						className="form-control"
						placeholder="value"
						onChange={e => handleChange(property, e.target.value)}
						value={value}
					/>
				);
			} else
				return (
					<input
						className="form-control"
						placeholder="value"
						value={value}
						onChange={e => handleChange(property, e.target.value)}
					/>
				);
	}
};

const MixedThing = ({
	options = {},
	i,
	label,
	map,
	type,
	value,
	array,
	amount: { min = 1, max = 1 } = {},
	chance,
	weight,
	handleChange = () => {},
	tables,
	...rest
}) => (
	<div className="row">
		{/* DRAGGER */}
		{options.sortable ? (
			<div className="col-auto">
				<div className="handle btn btn-default">
					<i className="fas fa-arrows-alt" />
				</div>
			</div>
		) : null}

		{/* KEY */}
		{options.hasKey ? (
			<div className="col-auto">
				<input
					className="form-control"
					placeholder="id"
					value={label}
					onChange={e => {
						var d = { ...map };
						d[e.target.value] = d[label];
						delete d[label];
						handleChange(options.property[0], d);
					}}
				/>
			</div>
		) : null}

		{/* TYPE */}
		<TypeChoose
			options={options.types}
			type={
				typeof value === "object" && (!type || type === "string")
					? "json"
					: type
			}
			{...{ handleChange }}
			property={options.property.concat(["type"])}
		/>

		{/* VALUE */}
		<div className="col">
			<Value
				{...rest}
				{...{ type, tables, value, i, handleChange }}
				isTextarea={options.isTextarea}
				property={options.property.concat(["value"])}
			/>
		</div>

		{/* AMOUNT */}
		{options.showAmount ? (
			<div className="col-auto">
				{(min !== undefined && min !== 1) || (max && max > 1) ? (
					<div className="row">
						<input
							type="number"
							min="0"
							max={max}
							className="col form-control"
							value={min}
							onChange={e =>
								handleChange(
									options.property.concat(["amount", "min"]),
									e.target.value
								)
							}
						/>
						<span className="col-auto">-</span>
						<input
							type="number"
							min={min}
							className="col form-control"
							value={max}
							defaultValue={1}
							onChange={e =>
								handleChange(
									options.property.concat(["amount", "max"]),
									e.target.value
								)
							}
						/>
					</div>
				) : (
					<div
						className="btn btn-default"
						onClick={() =>
							handleChange(options.property.concat(["amount", "max"]), 2)
						}
					>
						1
					</div>
				)}
			</div>
		) : null}

		{/* WEIGHT */}
		{options.showWeight ? (
			<div className="col-auto">
				{weight && weight !== 1 ? (
					<div className="input-group">
						<input
							type="number"
							min="1"
							max="1000"
							placeholder="100"
							className="form-control"
							defaultValue={1}
							value={weight}
							onChange={e =>
								handleChange(
									options.property.concat(["weight"]),
									e.target.value
								)
							}
						/>
						<div className="input-group-append">
							<span className="input-group-text">
								<i className="fas fa-weight-hanging" />
							</span>
						</div>
					</div>
				) : (
					<div
						className="btn btn-default"
						onClick={() => handleChange(options.property.concat(["weight"]), 2)}
					>
						1
					</div>
				)}
			</div>
		) : null}

		{/* CHANCE */}
		{options.showChance ? (
			<div className="col-auto">
				{chance && chance < 100 ? (
					<div className="input-group">
						<input
							type="number"
							min="1"
							max="100"
							placeholder="100"
							className="form-control"
							defaultValue={100}
							value={chance}
							onChange={e =>
								handleChange(
									options.property.concat(["chance"]),
									e.target.value
								)
							}
						/>
						<div className="input-group-append">
							<span className="input-group-text">
								<i className="fas fa-percentage" />
							</span>
						</div>
					</div>
				) : (
					<div
						className="btn btn-default"
						onClick={() =>
							handleChange(options.property.concat(["chance"]), 99)
						}
					>
						100 <i className="fas fa-percentage" />
					</div>
				)}
			</div>
		) : null}

		{/* DELETE */}
		<div className="col-auto">
			{i !== undefined ? (
				<button
					className="btn btn-danger"
					onClick={() => {
						var r = array.concat([]);
						r.splice(i, 1);
						handleChange(options.property[0], r);
					}}
				>
					<i className="far fa-trash-alt" />
				</button>
			) : null}
			{options.hasKey ? (
				<button
					className="btn btn-danger"
					onClick={() => {
						delete map[label];
						handleChange(options.property[0], map);
					}}
				>
					<i className="far fa-trash-alt" />
				</button>
			) : null}
			{options.deleteOne ? (
				<button
					className="btn btn-danger"
					onClick={() => {
						handleChange("name", null);
					}}
				>
					<i className="far fa-trash-alt" />
				</button>
			) : null}
		</div>
	</div>
);

const MixedKeyValue = ({
	options = {},
	map = {},
	handleChange = () => {},
	...rest
}) => (
	<div>
		{Object.keys(map).length ? (
			<ul className="p-0">
				{Object.keys(map).map((key, i) => {
					if (map[key] === undefined) return null;
					var { type, value } = map[key];

					//not properly stored, clean data
					if (type === undefined && value === undefined) {
						value = map[key];
						type =
							typeof value === "object"
								? value instanceof Array
									? "table"
									: "json"
								: "string";
						if (type === "table")
							value = { rows: value.map(v => ({ value: v })) };
					}
					return (
						<MixedThing
							key={i}
							label={key}
							options={{
								...options,
								property: [options.property, key],
								hasKey: true,
								types: options.types
							}}
							{...{ handleChange, map, type, value }}
							{...rest}
						/>
					);
				})}
			</ul>
		) : null}
		{map[""] === undefined ? (
			<button
				className="btn btn-primary"
				onClick={() => handleChange(["data", ""], "")}
			>
				<i className="fas fa-plus" /> add
			</button>
		) : null}
	</div>
);

const MixedSortable = ({
	options = {},
	array = [],
	handleChange = () => {},
	...rest
}) => (
	<ul className="p-0">
		<Sortable
			options={{ handle: ".handle" }}
			onChange={(order, sortable, { oldIndex, newIndex }) => {
				handleChange(options.property.concat([oldIndex, "sort"]), newIndex);
			}}
		>
			{array &&
				array.map((c, i) => (
					<MixedThing
						options={{
							...options,
							sortable: true,
							property: options.property.concat([i])
						}}
						{...c}
						key={c._id || i}
						{...{ i, array, handleChange }}
						{...rest}
					/>
				))}
		</Sortable>
	</ul>
);

export default MixedThing;
export { MixedKeyValue, MixedSortable };
