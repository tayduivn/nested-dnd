import React from "react";
import PropTypes from "prop-types";
import debounce from "debounce";

import { Link } from "../Util";
import Dropdown from "../Form/Dropdown";
import { MixedThing, MixedKeyValue, MixedSortable } from "../Form";
import IconOrImage from "./IconOrImage";

import { NOOP } from "../../util";

class Data extends React.PureComponent {
	handleChange = changes => {
		if (!changes) {
			return this.props.handleChange({ data: changes });
		}
		const data = { ...this.props.data, ...changes };

		// clear all deleted
		let key;
		for (key in data) {
			if (!data[key]) delete data[key];
		}
		this.props.handleChange({ data });
	};
	render() {
		const { data = {}, tables, generators, disabled } = this.props;
		const { handleChange } = this;
		return (
			<div className="form-group">
				<label className="mr-1">Data</label>
				<MixedKeyValue
					options={{
						property: "data",
						types: ["string", "generator", "table_id", "embed", "json", "table"]
					}}
					disabled={disabled}
					{...{ tables, generators, handleChange }}
					map={data}
				/>
			</div>
		);
	}
}

class Name extends React.Component {
	constructor(props) {
		super(props);
		this.pushChange = debounce(props.handleChange, 500);
		this.ref = React.createRef();
	}
	handleChange = e => {
		const isa = e.target.value;
		if (e.target.validity.valid) {
			this.pushChange({ isa });
		}
	};
	// don't rerender when the props.name updates (that's from saving)
	shouldComponentUpdate(nextProps, nextState) {
		const changeCreate = this.props.isCreate !== nextProps.isCreate;
		const changeDisabled = this.props.disabled !== nextProps.disabled;
		return changeCreate || changeDisabled;
	}
	_isDisabled() {
		if (document.activeElement === this.ref.current) return false;
		return this.props.disabled;
	}
	render() {
		const { inherits, isCreate, isa = "" } = this.props;
		return !inherits ? (
			<input
				id="generatorIsa"
				ref={this.ref}
				defaultValue={isa}
				type="text"
				required
				data-lpignore="true"
				name="isa"
				className="form-control editGen__title"
				autoFocus={isCreate}
				placeholder="generator label"
				onChange={this.handleChange}
				disabled={this._isDisabled()}
			/>
		) : (
			<span>{isa}</span>
		);
	}
}

class IsUnique extends React.PureComponent {
	handleChange = () => {
		this.props.handleChange({ isUnique: !this.props.isUnique });
	};
	render() {
		const { isUnique = false, disabled } = this.props;
		return (
			<label className="form-group">
				<div className={`switch ${disabled ? "switch--disabled" : ""}`}>
					<input
						id="generatorIsUnique"
						type="checkbox"
						className="switch-input"
						name="isUnique"
						checked={isUnique}
						onChange={this.handleChange}
						disabled={disabled}
					/>
					<span className="switch-label" data-on="On" data-off="Off" />
					<span className="switch-handle" />
				</div>
				<strong> Unique:</strong> There can only be one of these in a universe
			</label>
		);
	}
}

class ChooseRandom extends React.PureComponent {
	handleChange = () => {
		this.props.handleChange({ chooseRandom: !this.props.chooseRandom });
	};
	render() {
		const { chooseRandom = false, disabled } = this.props;
		return (
			<div>
				<label className={`switch ${disabled ? "switch--disabled" : ""}`}>
					<input
						type="checkbox"
						className="switch-input"
						name="chooseRandom"
						checked={chooseRandom}
						onChange={this.handleChange}
						disabled={disabled}
					/>
					<span className="switch-label" data-on="On" data-off="Off" />
					<span className="switch-handle" />
				</label>
				<strong> Replace with Random:</strong> When you add this is a universe, it will be replaced
				with a random generator that "Is a" {this.props.isa}.
			</div>
		);
	}
}

class Extends extends React.PureComponent {
	handleChange = (change = {}) => {
		if (change.isa) {
			this.props.handleChange({ extends: change.isa });
		}
		if (change.name === "") {
			this.props.handleChange({ extends: null });
		}
	};
	render() {
		const { xtends, isa, generators, url, disabled } = this.props;
		let options = Object.keys(generators);
		// don't allow to choose self
		options.splice(options.indexOf(isa), 1);
		return (
			<div className="form-group">
				<label>
					Is a... <Link to={url.replace(isa, encodeURIComponent(xtends))}>{xtends}</Link>{" "}
				</label>
				<Dropdown
					options={options.join(",")}
					disabled={disabled}
					onChange={this.handleChange}
					defaultValue={xtends || ""}
					classTextarea="form-control isa__input"
					notFoundError="Can't find generator"
					rows={1}
					saveOnBlur={true}
				/>
			</div>
		);
	}
}

class DisplayName extends React.PureComponent {
	constructor(props) {
		super(props);
		this.doChange = debounce(this.props.handleChange, 500);
	}
	handleChange = changed => {
		this.doChange(changed);
	};
	render() {
		const { name, tables, generators, disabled } = this.props;
		const { handleChange } = this;

		return (
			<div className="form-group">
				<label className="mr-1">Display Name</label>

				{name !== undefined && name !== null ? (
					<MixedThing
						options={{
							property: "name",
							types: ["string", "table_id", "table"],
							deleteOne: true
						}}
						disabled={disabled}
						{...{ ...name, tables, generators, handleChange, value: name.value || "" }}
					/>
				) : !disabled ? (
					<button
						className="btn btn-light btn-sm"
						disabled={disabled}
						onClick={() => handleChange({ name: { type: "string" } })}
					>
						<i className="fas fa-plus" /> edit
					</button>
				) : null}
			</div>
		);
	}
}

class Description extends React.PureComponent {
	static defaultProps = {
		desc: []
	};
	handleAdd = () => {
		const desc = [...this.props.desc];
		desc[desc.length] = { type: "string" };
		this.props.handleChange({ desc });
	};
	render() {
		const { desc, tables, generators, disabled, handleChange } = this.props;
		return (
			<div className="form-group">
				<label className="mr-1">Description</label>
				{desc && desc.length ? (
					<MixedSortable
						options={{
							property: "desc",
							types: ["string", "table_id", "table"],
							isTextarea: true
						}}
						disabled={disabled}
						array={desc}
						{...{ handleChange, tables, generators }}
					/>
				) : null}
				{!disabled ? (
					<button className="btn btn-light btn-sm" onClick={this.handleAdd}>
						<i className="fas fa-plus" /> add
					</button>
				) : null}
			</div>
		);
	}
}

class InArr extends React.PureComponent {
	handleAdd = () => {
		const inArr = [...this.props.inArr] || [];
		inArr[inArr.length] = { type: "generator" };
		this.props.handleChange({ in: inArr });
	};
	render() {
		const { inArr, tables, handleChange, generators, disabled } = this.props;
		return (
			<div className="form-group">
				<label className="mr-1">Contains</label>
				<MixedSortable
					options={{
						property: "in",
						types: ["generator", "string", "embed", "data", "table_id"],
						showAmount: true
					}}
					disabled={disabled}
					array={inArr}
					tables={tables && tables.filter(t => t.returns === "generator")}
					{...{ handleChange, generators }}
				/>
				{!disabled ? (
					<button className="btn btn-light btn-sm" onClick={this.handleAdd}>
						<i className="fas fa-plus" /> add
					</button>
				) : null}
			</div>
		);
	}
}

class Source extends React.PureComponent {
	handleChange = e => {
		this.props.handleChange({ source: { ...this.props.source, url: e.target.value } });
	};
	render() {
		const { source, disabled } = this.props;
		return (
			<div className="form-group">
				<label>Source URL</label>
				<input
					data-lpignore="true"
					disabled={disabled}
					value={source.url || ""}
					name="source"
					className="form-control"
					onChange={this.handleChange}
				/>
			</div>
		);
	}
}

class DeleteButton extends React.PureComponent {
	render() {
		return (
			<button className="btn btn-danger" onClick={this.props.handleDelete}>
				Delete Generator
			</button>
		);
	}
}

const ToggleOptions = ({ chooseRandom, isUnique, handleChange, disabled, isa }) => (
	<>
		{!chooseRandom ? <IsUnique {...{ isUnique, handleChange, disabled }} /> : null}
		{!isUnique ? <ChooseRandom {...{ chooseRandom, isa, handleChange, disabled }} /> : null}
	</>
);

export default class EditGeneratorDisplay extends React.PureComponent {
	static propTypes = {
		isEmbedded: PropTypes.bool,
		index: PropTypes.number,
		handleChange: PropTypes.func,
		generators: PropTypes.array
	};
	static defaultProps = {
		url: "",
		generators: [],
		handleChange: () => {}
	};
	handleSubmit = e => {
		e.preventDefault();
		e.target.blur();
	};
	render() {
		const { inherits, isCreate, isa, extends: xtends, name, desc, icon, _id, url } = this.props;
		const { in: inArr = [], tables = [], generators = [], source = {}, isUnique } = this.props;
		const { handleChange, handleDelete, chooseRandom, data = {}, readOnly: disabled } = this.props;

		return (
			<form className="editGen container mt-5" onSubmit={this.handleSubmit} autoComplete="off">
				{this.props.isEmbedded ? (
					<h3>↳ Row {this.props.index}</h3>
				) : (
					<Name {...{ inherits, isa, isCreate, handleChange, disabled }} />
				)}

				{!isCreate ? (
					<React.Fragment>
						{!this.props.isEmbedded ? (
							<ToggleOptions {...{ chooseRandom, isUnique, handleChange, disabled, isa }} />
						) : null}

						<Extends key={_id} {...{ xtends, isa, generators, url, handleChange, disabled }} />

						{!chooseRandom ? (
							<>
								<DisplayName {...{ name, tables, generators, handleChange, disabled }} />
								<IconOrImage {...{ icon, handleChange, disabled }} />
								<Description {...{ desc, handleChange, tables, generators, disabled }} />
								<InArr {...{ inArr, tables, handleChange, generators, disabled }} />
								<Data {...{ data, handleChange, tables, generators, disabled }} />
								<Source {...{ source, handleChange, disabled }} />
							</>
						) : null}

						{!disabled ? <DeleteButton {...{ handleDelete, disabled }} /> : null}
					</React.Fragment>
				) : (
					<button className="btn btn-primary" onClick={this.props.handleAdd}>
						Create
					</button>
				)}
			</form>
		);
	}
}
