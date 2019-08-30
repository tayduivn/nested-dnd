import React from "react";
import PropTypes from "prop-types";

const DescriptionComponent = ({ cls, txt, desc = [], isUniverse, handle, newLine }) => (
	<ul
		id="description"
		className={cls + " max-contrast " + (!desc.length ? "empty" : "")}
		onKeyDown={handle.keydown}
		onKeyUp={handle.keyup}
		onBlur={handle.blur}
	>
		{desc.map((d, i) => (
			<li
				onPaste={handle.paste}
				key={i}
				contentEditable={isUniverse}
				ref={i === desc.length - 1 ? newLine : undefined}
				dangerouslySetInnerHTML={{ __html: d }}
			/>
		))}
		{isUniverse && !desc.length ? (
			<li
				key={desc.length + 1}
				onPaste={handle.paste}
				type="text"
				ref={newLine}
				contentEditable={true}
				data-new="true"
			/>
		) : null}
	</ul>
);

export default class Description extends React.PureComponent {
	static propTypes = {
		desc: PropTypes.string,
		cls: PropTypes.string,
		txt: PropTypes.string
	};

	state = {
		focusNew: false
	};
	constructor() {
		super();
		this.newLine = React.createRef();
	}
	componentDidUpdate() {
		if (this.state.focusNew) {
			if (this.newLine && this.newLine.current) {
				if (this.state.focusNew !== true) {
					var child = this.newLine.current.parentElement.children[this.state.focusNew];
					if (child) child.focus();
				} else this.newLine.current.focus();
			}
			this.setState({ focusNew: false });
		}
	}
	handleKeyDown = e => {
		var desc = this.props.desc.split("\n") || [];
		var i = Array.prototype.indexOf.call(e.target.parentElement.children, e.target) || 0;
		const input = e.target.innerText.split(/\r\n|\n|\r/g).filter(s => s.trim().length);

		if (e.keyCode === 13 || e.keyCode === 9) {
			var next = e.target.nextElementSibling;
			if (next) {
				if (e.shiftKey) {
					desc.splice(i + 1, 0, "");
					this.setState({ focusNew: i + 1 });
					e.target.blur();
					this.props.handleChange({ desc });
				} else next.focus();
			} else {
				if (!desc.length) {
					desc = desc.concat(input);
				}
				desc.push("");
				this.setState({ focusNew: true });
				e.target.blur();
				this.props.handleChange({ desc });
			}
			e.preventDefault();
			return false;
		}
	};

	backspaceOnEmpty = (desc, e, i) => {
		//backspace on an empty element
		desc.splice(i, 1);
		e.target.dataset["deleting"] = true;
		var prev = e.target.previousElementSibling;
		// e.target.remove();
		this.props.handleChange({ desc });
		if (prev) prev.focus();
		e.preventDefault();
		return false;
	};

	handleKeyUp = e => {
		var desc = this.props.desc.split("\n") || [];
		var i = Array.prototype.indexOf.call(e.target.parentElement.children, e.target) || 0;
		var text = e.target.innerText.trim();

		if (e.keyCode === 38 && e.target.previousElementSibling) {
			// up
			e.target.previousElementSibling.focus();
			return;
		} else if (e.keyCode === 40 && e.target.nextElementSibling) {
			// down
			var next = e.target.nextElementSibling;
			if (next.dataset.new === "true") {
				next.click();
			}
			next.focus();
			return;
		} else if (e.keyCode === 8 && !text.length) {
			return this.backspaceOnEmpty(desc, e, i);
		}
	};
	handleBlur = e => {
		var desc = [];
		var lines = e.target.parentElement.children;
		let isChanged = false;
		let original = this.props.desc.split("\n");

		if (e.target.dataset["deleting"]) {
			delete e.target.dataset["deleting"];
			return;
		}

		for (var i = 0, c; i < lines.length; i++) {
			c = lines[i];
			var text = c.innerText;
			text = text.length ? text.split(/\r\n|\n|\r/g).filter(s => s.trim().length) : [""];

			// if it's different, mark it
			if (text.length !== 1 || text[0] !== original[i]) {
				isChanged = true;
			}

			desc.push(...text);
			delete c.dataset["deleting"];
		}

		if (isChanged) {
			this.props.handleChange({ desc });
		}
	};
	handlePaste = e => {
		e.preventDefault();

		// get text representation of clipboard
		var text = e.clipboardData.getData("text/plain");

		// insert text manually
		document.execCommand("insertHTML", false, text);
	};

	render() {
		const { desc: descStr, cls, txt, isUniverse } = this.props;
		const handle = {
			blur: this.handleBlur,
			paste: this.handlePaste,
			keydown: this.handleKeyDown,
			keyup: this.handleKeyUp
		};
		const desc = descStr.split("\n");

		return (
			<DescriptionComponent {...{ desc, cls, txt, isUniverse, handle, newLine: this.newLine }} />
		);
	}
}
