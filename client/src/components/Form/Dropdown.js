import React from "react";
import PropTypes from "prop-types";
import Sifter from "sifter";
import debounce from "debounce";
import { FixedSizeList, areEqual } from "react-window";

const NOT_FOUND_ERROR = "Can't find option";

class Input extends React.PureComponent {
	render() {
		return (
			<textarea
				ref={this.props.htmlRef}
				className={`dropdown__input ${this.props.classTextarea}`}
				type="text"
				rows={this.props.rows}
				onChange={this.props.handleChange}
				onKeyDown={this.props.handleKeyDown}
				onFocus={this.props.handleFocus}
				onBlur={this.props.handleBlur}
				onClick={this.props.handleClick}
				disabled={this.props.disabled}
				placeholder={this.props.placeholder}
				value={this.props.input}
			/>
		);
	}
}

class Option extends React.PureComponent {
	render() {
		const { matches, selected, className, clickEvent, handleClick } = this.props.data;
		const { index, style } = this.props;

		const item = matches[index];
		const isSelected = item === selected ? `--selected` : "";

		if (!item) return null;
		return (
			<li
				className={`dropdown__option ${className}__option ${isSelected}`}
				data-value={item.value}
				data-label={item.label}
				{...{ [clickEvent]: handleClick }}
				style={style}
			>
				{item.label}
			</li>
		);
	}
}

// relies on key to reset
export default class Dropdown extends React.PureComponent {
	static propTypes = {
		// comma delimited options
		options: PropTypes.string,
		disabled: PropTypes.bool,
		className: PropTypes.string,
		classTextarea: PropTypes.string,
		rows: PropTypes.number,
		placeholder: PropTypes.string,
		notFoundError: PropTypes.string,
		saveOnBlur: PropTypes.bool,
		useOnClick: PropTypes.bool,
		allowCustom: PropTypes.bool,
		// options never change
		fixedOptions: PropTypes.array,
		isMulti: PropTypes.bool,
		limit: PropTypes.number,
		itemHeight: PropTypes.number
		//OptionComponent
	};

	static defaultProps = {
		className: "dropdown",
		notFoundError: NOT_FOUND_ERROR,
		classTextarea: "form-control",
		limit: 20,
		itemHeight: 30,
		disabled: false,
		saveOnBlur: false,
		useOnClick: false,
		allowCustom: false,
		isMulti: false,
		OptionComponent: Option
	};
	constructor(props) {
		super(props);

		this.setSifter(props.options, props.fixedOptions);

		this.state = {
			input: props.defaultValue || "",
			matches: [],
			selected: false,
			open: false,
			error: false
		};
		this.ref = React.createRef();

		this.sift = debounce(this.sift, 100);
	}
	setSifter(options = "", fixedOptions) {
		if (!fixedOptions) {
			this.optionValues = options.split(",");
			this.options = this.optionValues.map(g => ({ label: g, value: g }));
		} else {
			this.optionValues = fixedOptions.map(o => o.value);
			this.options = fixedOptions;
		}
		this.sifter = new Sifter(this.options);
	}
	componentDidUpdate(prevProps) {
		if (this.props.options !== prevProps.options && !this.props.fixedOptions)
			this.setSifter(this.props.options);
	}
	handleKeyDown = e => {
		const { selected, matches } = this.state;
		const index = matches.indexOf(selected);

		// up
		if (e.keyCode === 38) {
			// hit up on the topmost option
			if (index === 0) {
				this.setState({ selected: false, open: false });
			} else {
				this.setState({ selected: matches[index - 1] });
			}
		}
		// down
		else if (e.keyCode === 40) {
			this.setState({ open: true, selected: matches[index + 1] });
		} else if (e.key === "Enter") {
			// hitting enter on a selected item
			if (this.state.selected) {
				this.setState({ input: this.state.selected.label, open: false }, this.sift);
			}
			this.submit(this.state.selected.value || this.state.input);
			e.preventDefault();
		}
	};
	sift = () => {
		const input = this.state.input;
		let newMatches = { items: [] };
		if (input.length) {
			newMatches = this.sifter.search(input, { fields: ["label"], limit: this.props.limit });
		}
		const matches = newMatches.items.map(({ id }) => this.options[id]);
		this.setState({ matches });
	};
	handleChange = e => {
		const input = e.target.value;

		this.setState({ input }, this.sift);
	};
	handleBlur = e => {
		this.setState({ open: false, selected: false });
		if (this.props.saveOnBlur) {
			this.submit(e.target.value);
		}
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
	// fire on mousedown so it happens before blur event
	handleClick = e => {
		if (e.button === 0) {
			this.setState({ input: e.target.dataset.label }, this.sift);
			this.submit(e.target.dataset.value);
		}
	};
	submit = value => {
		const isFound = this.optionValues.includes(value);

		// check validity
		if (value && !this.props.allowCustom && !isFound) {
			this.ref.current.setCustomValidity(this.props.notFoundError);
			this.setState({ error: this.props.notFoundError });
			return;
		} else {
			this.ref.current.setCustomValidity("");
			this.setState({ error: false });
		}

		// todo: make generic
		const isNum = value !== "" && !isNaN(value);
		const prop = isFound ? "isa" : isNum ? "index" : "name";
		this.props.onChange({ [prop]: this.props.isMulti ? [value] : value });
		if (this.props.clearOnSubmit) {
			this.setState({ input: "" }, this.sift);
		}
	};
	_getListProps() {
		const itemSize = this.props.itemHeight;
		const length = this.state.matches.length;
		const height = length < 7 ? length * itemSize : 7 * itemSize;
		return {
			height,
			itemCount: this.state.matches.length,
			itemSize: itemSize,
			itemData: {
				selected: this.state.selected,
				clickEvent: this.props.useOnClick ? "onClick" : "onMouseDown",
				handleClick: this.handleClick,
				handleHover: this.handleHover,
				matches: this.state.matches,
				className: this.props.className
			}
		};
	}
	render() {
		const { input } = this.state;
		const { handleChange, handleKeyDown, handleFocus, handleBlur } = this;
		const { disabled, className, rows, placeholder, classTextarea } = this.props;
		const { OptionComponent } = this.props;
		return (
			<React.Fragment>
				<div className={`dropdown ${className}`}>
					<div className="feedback-icon" />
					<Input
						{...{ input, handleChange, handleFocus, handleBlur, handleKeyDown }}
						{...{ rows, placeholder, htmlRef: this.ref, className, disabled, classTextarea }}
						handleClick={this.handleClickTextarea}
					/>
					<div
						className={`dropdown__menu ${this.props.className}__menu ${
							this.state.open ? "--open" : ""
						}`}
					>
						<FixedSizeList {...this._getListProps()}>{OptionComponent}</FixedSizeList>
					</div>
				</div>
				<div className="invalid-feedback">{this.state.error}</div>
			</React.Fragment>
		);
	}
}

/*
{this.state.matches.map((item, i) => (
	<OptionComponent
		key={i}
		{...{ item, selected, handleClick, className, useOnClick, handleHover }}
	/>
))}
*/
