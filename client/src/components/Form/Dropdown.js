import React from "react";
import PropTypes from "prop-types";
import Sifter from "sifter";
import debounce from "debounce";
import { FixedSizeList } from "react-window";
import defaultStyles from "./Dropdown.module.scss";

const NOT_FOUND_ERROR = "Can't find option";

const VariableSizeList = ({ itemData }) => {
	return itemData.matches.map((match, index) => {
		return <Option key={match.value || index} data={itemData} index={index} />;
	});
};

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
	styles,
	input
}) {
	return (
		<textarea
			ref={htmlRef}
			className={`${styles.input} ${dirty ? styles.dirty : ""} ${!input ? styles.empty : ""}`}
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
		const { matches, selected, clickEvent, handleClick, styles } = this.props.data;
		const { index } = this.props;
		// extend the default styles

		const item = matches[index];
		const isSelected = item === selected ? styles.selected : "";

		if (!item) return null;
		return (
			<li
				className={`${styles.option} ${isSelected}`}
				data-value={item.value}
				data-label={item.label}
				{...{ [clickEvent]: handleClick }}
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
		allowCustom: PropTypes.bool,
		disabled: PropTypes.bool,
		fixedOptions: PropTypes.array, // options never change
		isMulti: PropTypes.bool,
		itemHeight: PropTypes.number,
		limit: PropTypes.number,
		notFoundError: PropTypes.string,
		onChange: PropTypes.func,
		options: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
		placeholder: PropTypes.string,
		rows: PropTypes.number,
		saveOnBlur: PropTypes.bool,
		styles: PropTypes.object,
		useOnClick: PropTypes.bool
		//OptionComponent
	};

	static defaultProps = {
		notFoundError: NOT_FOUND_ERROR,
		limit: 20,
		disabled: false,
		saveOnBlur: false,
		useOnClick: false,
		allowCustom: false,
		isMulti: false,
		OptionComponent: Option,
		onChange: () => {},
		styles: defaultStyles
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

		if (!this.state.open) {
			this.setState({ open: true });
		}
	};
	sift = () => {
		const input = this.state.input;
		let newMatches = { items: [] };
		if (input && input.length) {
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
	handleMouseDownOption = e => {
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
		const styles = { ...defaultStyles, ...this.props.styles };
		let result = {
			height,
			itemSize: this.props.itemHeight,
			itemCount: this.state.matches.length,
			itemData: {
				selected: this.state.selected,
				clickEvent: this.props.useOnClick ? "onClick" : "onMouseDown",
				handleClick: this.handleMouseDownOption,
				handleHover: this.handleHover,
				matches: this.state.matches,
				styles: styles
			}
		};
		return result;
	}
	render() {
		const { input, dirty } = this.state;
		const { handleChange, handleKeyDown, handleFocus, handleBlur } = this;
		const { disabled, rows, placeholder } = this.props;
		const { OptionComponent } = this.props;
		const List = this.props.itemHeight ? FixedSizeList : VariableSizeList;
		const styles = { ...defaultStyles, ...this.props.styles };
		return (
			<React.Fragment>
				<div className={styles.dropdown}>
					<Input
						{...{ input, handleChange, handleFocus, handleBlur, handleKeyDown, styles }}
						{...{ rows, placeholder, htmlRef: this.ref, disabled, dirty }}
						handleClick={this.handleClickTextarea}
					/>
					{this.props.children}
					<div className={`${styles.menu} ${this.state.open ? styles.open : ""}`}>
						<List {...this._getListProps()}>{OptionComponent}</List>
					</div>
				</div>
				<div className={styles.error}>{this.state.error}</div>
			</React.Fragment>
		);
	}
}
