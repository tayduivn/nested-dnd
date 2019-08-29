import React from "react";
import PropTypes from "prop-types";
import Sifter from "sifter";
import debounce from "debounce";
import { FixedSizeList } from "react-window";
import "./Dropdown.scss";

const NOT_FOUND_ERROR = "Can't find option";

const VariableSizeList = ({ itemData }) =>
	itemData.matches.map((match, index) => (
		<Option key={match.value} data={itemData} index={index} />
	));

function Input({
	htmlRef,
	classTextarea: className,
	dirty,
	rows,
	handleChange,
	handleFocus,
	handleKeyDown,
	handleBlur,
	handleClick,
	disabled,
	placeholder,
	input
}) {
	return (
		<textarea
			ref={htmlRef}
			className={`dropdown__input ${className} ${dirty ? "dirty" : ""} ${!input ? "empty" : ""}`}
			type="text"
			rows={rows}
			onChange={handleChange}
			onKeyDown={handleKeyDown}
			onFocus={handleFocus}
			onBlur={handleBlur}
			onClick={handleClick}
			disabled={disabled}
			placeholder={placeholder}
			value={input}
		/>
	);
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
		options: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
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
		itemHeight: PropTypes.number,
		onChange: PropTypes.func,
		sibling: PropTypes.node,
		style: PropTypes.object
		//OptionComponent
	};

	static defaultProps = {
		className: "dropdown",
		notFoundError: NOT_FOUND_ERROR,
		classTextarea: "form-control",
		limit: 20,
		disabled: false,
		saveOnBlur: false,
		useOnClick: false,
		allowCustom: false,
		isMulti: false,
		OptionComponent: Option,
		onChange: () => {},
		// sibling sits alongside (right after) the textarea. Useful for complex placeholders
		sibling: null
	};
	constructor(props) {
		super(props);

		this.setSifter(props.options, props.fixedOptions);

		this.state = {
			input: props.defaultValue || "",
			matches: [],
			selected: false,
			open: false,
			error: false,
			dirty: false
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
		if (
			this.props.options !== prevProps.options ||
			this.props.fixedOptions !== prevProps.fixedOptions
		)
			this.setSifter(this.props.options, this.props.fixedOptions);
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
			this.submit((this.state.selected && this.state.selected.value) || this.state.input);
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

		this.setState({ input, dirty: true }, this.sift);
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
		console.log("clicked");
		if (e.button === 0) {
			this.setState({ input: e.target.dataset.label }, this.sift);
			this.submit(e.target.dataset.value);
		}
	};
	submit = value => {
		const foundIndex = this.optionValues.indexOf(value);
		const isFound = foundIndex !== -1;
		const option = this.options[foundIndex];

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
		const prop = isFound ? (option.table ? "table" : "isa") : isNum ? "index" : "name";
		this.props.onChange({ [prop]: this.props.isMulti ? [value] : value });
		if (this.props.clearOnSubmit) {
			this.setState({ input: "" }, this.sift);
		}
	};
	_getListProps() {
		const itemSize = this.props.itemHeight || 30;
		const length = this.state.matches.length;
		const height = length < 7 ? length * itemSize : 7 * itemSize;
		let result = {
			height,
			itemSize: this.props.itemHeight,
			itemCount: this.state.matches.length,
			itemData: {
				selected: this.state.selected,
				clickEvent: this.props.useOnClick ? "onClick" : "onMouseDown",
				handleClick: this.handleClick,
				handleHover: this.handleHover,
				matches: this.state.matches,
				className: this.props.className
			}
		};
		return result;
	}
	render() {
		const { input, dirty } = this.state;
		const { handleChange, handleKeyDown, handleFocus, handleBlur } = this;
		const { disabled, className, rows, placeholder, classTextarea } = this.props;
		const { OptionComponent } = this.props;
		const List = this.props.itemHeight ? FixedSizeList : VariableSizeList;
		return (
			<React.Fragment>
				<div className={`dropdown ${className}`} style={this.props.style}>
					<div className="feedback-icon" />
					<Input
						{...{ input, handleChange, handleFocus, handleBlur, handleKeyDown }}
						{...{ rows, placeholder, htmlRef: this.ref, className, disabled, classTextarea, dirty }}
						handleClick={this.handleClickTextarea}
					/>
					{this.props.sibling}
					<div className={`dropdown__menu ${className}__menu ${this.state.open ? "--open" : ""}`}>
						<List {...this._getListProps()}>{OptionComponent}</List>
					</div>
				</div>
				<div className="invalid-feedback">{this.state.error}</div>
			</React.Fragment>
		);
	}
}
