import React from "react";

import IconSelect from "../Form/IconSelect";

const DEFAULT_STATUS = { isEnabled: true };

const NOOP = () => {};

function mixedToPlainType(data) {
	if (!data || typeof data === "string") return data;
	else if (!data.type || data.type === "string") return data.value;
	else if (data.type === "table") {
		return data.value.rows.map(r => mixedToPlainType(r));
	}
}

class SelectCategory extends React.PureComponent {
	handleChangeUseImage = e => {
		this.props.doChange({ category: e.target.value });
	};
	render() {
		return (
			<select
				value={this.props.category || "icon"}
				className="form-control form-control-sm"
				onChange={this.handleChangeUseImage}
			>
				<option value="icon">Icon</option>
				<option value="img">Image</option>
				<option value="char">Character</option>
			</select>
		);
	}
}

class Value extends React.PureComponent {
	render() {
		const { category, plainValue, handleChangeTxt, ...iconSelectProps } = this.props;
		return category === "img" ? (
			<input className="form-control" value={plainValue} onChange={handleChangeTxt} />
		) : category === "char" ? (
			<input className="form-control" value={plainValue} onChange={handleChangeTxt} maxlength="1" />
		) : (
			<IconSelect {...iconSelectProps} />
		);
	}
}

export default class IconOrImage extends React.PureComponent {
	handleAdd = () => {
		this.doChange({ category: "icon" });
	};
	handleUseDefault = () => {
		this.doChange(undefined);
	};
	handleChangeTxt = e => {
		this.doChange({ value: e.target.value });
	};
	handleChangeIcon = newObj => {
		this.doChange(newObj);
	};
	doChange = newObj => {
		const old = this.props.icon || {};
		const icon = newObj ? { ...old, ...newObj } : newObj;
		this.props.handleChange({ style: { icon } });
	};
	_getIconSelectProps() {
		return {
			value: mixedToPlainType(this.props.icon),
			status: DEFAULT_STATUS,
			saveProperty: this.handleChangeIcon,
			setPreview: NOOP,
			multi: true
		};
	}
	render() {
		const { icon, disabled } = this.props;
		const { handleChangeTxt, doChange } = this;
		const category = icon && icon.category;
		const iconSelectProps = this._getIconSelectProps();
		const plainValue = mixedToPlainType(icon || {});
		return icon ? (
			<React.Fragment>
				<button className="btn btn-light btn-sm" onMouseDown={this.handleUseDefault}>
					use default?
				</button>
				<SelectCategory {...{ doChange, category }} />
				<Value {...{ category, plainValue, handleChangeTxt, ...iconSelectProps }} />
			</React.Fragment>
		) : (
			<div className="form-group">
				<label className="mr-1">Icon or Image</label>
				{!disabled ? (
					<button className="btn btn-light btn-sm" onClick={this.handleAdd}>
						<i className="fas fa-plus" /> add
					</button>
				) : null}
			</div>
		);
	}
}
