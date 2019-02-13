import React from "react";
import { connect } from "react-redux";
//import Creatable from "react-select/lib/Creatable";
import { FixedSizeList as List } from "react-window";
import { getUniverse } from "../Explore/reducers";
import { addChild } from "../Explore/actions";
import Sifter from "sifter";

import "./IsASelect.css";

const height = 30;

class MenuList extends React.Component {
	render() {
		const { options, children, maxHeight, getValue } = this.props;
		const [value] = getValue();
		const initialOffset = options.indexOf(value) * height;

		return (
			<List
				height={isNaN(maxHeight) ? height : maxHeight}
				itemCount={children.length}
				itemSize={height}
				initialScrollOffset={initialOffset}
			>
				{({ index, style }) => {
					delete children[index].props.innerProps.onMouseMove; //FIX LAG!!
					delete children[index].props.innerProps.onMouseOver; //FIX LAG!!
					return (
						<div className="text-option" style={style}>
							{children[index]}
						</div>
					);
				}}
			</List>
		);
	}
}

class IsaInput extends React.PureComponent {
	render() {
		return (
			<textarea
				className="isa__input"
				type="text"
				onChange={this.props.handleChange}
				onKeyDown={this.props.handleKeyDown}
				onFocus={this.props.handleFocus}
				onBlur={this.props.handleBlur}
				onClick={this.props.handleClick}
				placeholder="✚"
				value={this.props.input}
			/>
		);
	}
}

class IsASelectComponent extends React.PureComponent {
	state = {
		input: "",
		matches: [],
		selected: false,
		open: true
	};
	constructor(props) {
		super(props);
		this.setSifter(props.options);
	}
	setSifter(options = "") {
		this.options = options.split(",").map(g => ({ label: g, value: g }));
		this.sifter = new Sifter(this.options);
	}
	componentDidUpdate(prevProps) {
		if (this.props.options !== prevProps.options) this.setSifter(this.props.options);
	}
	handleKeyDown = e => {
		const { selected, matches } = this.state;
		const index = matches.indexOf(selected);

		if (e.keyCode === 38) {
			this.setState({ selected: matches[index - 1] });
		} else if (e.keyCode === 40) {
			this.setState({ selected: matches[index + 1] });
		} else if (e.key === "Enter") {
			this.submit(this.state.selected || this.state.input);
			e.preventDefault();
		}
	};
	handleChange = e => {
		const input = e.target.value;
		let matches = { items: [] };
		if (input.length) {
			matches = this.sifter.search(input, { fields: ["label"], limit: 20 });
		}
		const m = matches.items.map(({ id }) => this.options[id].label);

		this.setState({ input, matches: m });
	};
	handleBlur = e => {
		this.setState({ open: false, selected: false });
	};
	handleFocus = e => {
		this.setState({ open: true });
	};
	handleHover = e => {
		this.setState({ selected: false });
	};
	handleClickTextarea = e => {
		e.target.focus();
	};
	handleClick = e => {
		this.setState({ input: e.target.dataset.value });
		this.submit(e.target.dataset.value);
	};
	submit = value => {
		const gens = this.props.options.split(",");
		const isGen = gens.includes(value);
		const isNum = !isNaN(value);
		const prop = isGen ? "isa" : isNum ? "index" : "name";
		this.props.addChild({ [prop]: value });
		this.setState({ input: "" });
	};
	render() {
		const { input } = this.state;
		const { handleChange, handleKeyDown, handleFocus, handleBlur } = this;
		return (
			<div className="isa">
				<ul className="isa__dropdown" onMouseEnter={this.handleHover}>
					{this.state.open &&
						this.state.matches.map((match, i) => {
							const selected = match === this.state.selected ? "isa__option--selected" : "";
							return (
								<li
									key={i}
									className={`isa__option ${selected}`}
									data-value={match}
									onClick={this.handleClick}
								>
									{match}
								</li>
							);
						})}
				</ul>
				<IsaInput
					{...{ input, handleChange, handleKeyDown, handleFocus, handleBlur }}
					handleClick={this.handleClickTextarea}
				/>
			</div>
		);
	}
}

const IsASelect = connect(
	function mapStateToProps(state) {
		const { pack = {}, universe = {}, index } = getUniverse(state);
		const gens = (pack.builtpack && Object.keys(pack.builtpack.generators)) || [];
		return {
			options: gens.join(","),
			universeId: universe._id,
			index
		};
	},
	function matchDispatchToProps(dispatch) {
		return {
			addChild: (universeId, index, value) => dispatch(addChild(universeId, index, value))
		};
	},
	function mergeProps(stateProps, dispatchProps) {
		return {
			...stateProps,
			...dispatchProps,
			addChild: child => dispatchProps.addChild(stateProps.universeId, stateProps.index, child)
		};
	}
)(IsASelectComponent);

export default IsASelect;
export { MenuList };
