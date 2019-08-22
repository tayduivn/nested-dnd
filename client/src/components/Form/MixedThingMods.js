import React from "react";

class Num extends React.PureComponent {
	handleChange = e => {
		this.props.handleChange({ [this.props.property]: parseInt(e.target.value, 10) });
	};
	render() {
		const { min, max, value, className } = this.props;
		return <input type="number" {...{ min, max, value, className }} onChange={this.handleChange} />;
	}
}

class Amount extends React.PureComponent {
	state = {
		open: false
	};
	handleOpen = () => {
		this.setState({ open: true });
	};
	handleReset = () => {
		this.props.handleChange({ amount: { max: 2 } });
	};
	handleChange = value => {
		const old = { min: this.props.min, max: this.props.max };
		this.props.handleChange({ amount: { ...old, ...value } });
	};
	render() {
		const { min, max } = this.props;
		const { handleChange } = this;
		const numProps = { handleChange, className: "col form-control" };
		return (
			<div className="col-auto">
				{this.state.open || (min !== undefined && min !== 1) || (max && max > 1) ? (
					<div className="row">
						<Num value={min} property="min" min="0" max={max} {...numProps} />
						<span className="col-auto">-</span>
						<Num value={max || 1} property="max" min={min} {...numProps} />
					</div>
				) : (
					<div className="btn btn-light btn-sm" onClick={this.handleOpen}>
						1
					</div>
				)}
			</div>
		);
	}
}

const WEIGHT_DEFAULTS = {
	type: "number",
	min: "1",
	max: "1000",
	placeholder: "100",
	className: "form-control"
};

class Weight extends React.PureComponent {
	static defaultProps = {
		weight: 1
	};
	handleReset = () => {
		this.props.handleChange({ weight: 2 });
	};
	handleChange = e => {
		this.props.handleChange({ weight: parseInt(e.target.value, 10) });
	};
	render() {
		const { weight } = this.props;
		return (
			<div className="col-auto">
				{weight && weight !== 1 ? (
					<div className="input-group">
						<input {...WEIGHT_DEFAULTS} value={weight} onChange={this.handleChange} />
						<div className="input-group-append">
							<span className="input-group-text">
								<i className="fas fa-weight-hanging" />
							</span>
						</div>
					</div>
				) : (
					<div className="btn btn-light btn-sm" onClick={this.handleReset}>
						1
					</div>
				)}
			</div>
		);
	}
}

const CHANCE_DEFAULTS = {
	type: "number",
	min: "1",
	max: "100",
	placeholder: "100",
	className: "form-control",
	defaultValue: 100
};

class Chance extends React.PureComponent {
	handleReset = () => {
		this.props.handleChange({ chance: 99 });
	};
	handleChange = e => {
		this.props.handleChange({ chance: e.target.value });
	};
	render() {
		const { chance } = this.props;
		return (
			<div className="col-auto">
				{chance && chance < 100 ? (
					<div className="input-group">
						<input {...CHANCE_DEFAULTS} value={chance} onChange={this.handleChange} />
						<div className="input-group-append">
							<span className="input-group-text">
								<i className="fas fa-percentage" />
							</span>
						</div>
					</div>
				) : (
					<div className="btn btn-light btn-sm" onClick={this.handleReset}>
						100 <i className="fas fa-percentage" />
					</div>
				)}
			</div>
		);
	}
}

export default class MixedThingMods extends React.PureComponent {
	render() {
		const { min, max, weight, chance, handleChange } = this.props;
		const { showAmount, showWeight, showChance } = this.props;
		return (
			<React.Fragment>
				{showAmount ? <Amount {...{ min, max, handleChange }} /> : null}

				{showWeight ? <Weight {...{ weight, handleChange }} /> : null}

				{showChance ? <Chance {...{ chance, handleChange }} /> : null}
			</React.Fragment>
		);
	}
}
