import React from "react";
import ColorPicker from "components/Form/ColorPicker";

class BGSelectPopoverComponent extends React.PureComponent {
	render() {
		const { htmlRef, cls, display, handleClick, handleClose, currentSelected } = this.props;

		return (
			<button id="bgOptions" className={`title__btn ${cls}`} tabIndex="0" ref={htmlRef}>
				<div type="button" data-toggle="popover" onClick={handleClick}>
					<div className={`bg swatch`} />
				</div>
				<div
					id="bgOptionsPopover"
					className={"popover animated fadeIn " + (display ? "" : "d-none")}
					role="tooltip"
					onClick={handleClick}
				>
					<div className="arrow" />
					<div className="popover-body">
						{currentSelected ? (
							<div id="clearColor" className="btn btn-default" data-class="">
								<i className="fa fa-times" /> use parent style
							</div>
						) : null}
						<ColorPicker className="d-none" />
					</div>
				</div>
				{display ? <div className="popover-cover" onClick={handleClose} /> : null}
			</button>
		);
	}
}

export default class BGSelectPopover extends React.PureComponent {
	static defaultProps = {
		cls: ""
	};
	constructor(props) {
		super(props);
		this.ref = React.createRef();
		this.handleClick = this.handleClick.bind(this);

		this.state = {
			display: false
		};
	}

	handleClose = () => {
		this.setState({ display: false });
		window
			.$(this.ref.current)
			.find(".sample")
			.removeClass("selected");
	};

	currentSelected = () => {
		return this.props.cls.split(" ").find(c => c.startsWith("bg-"));
	};
	handleClick(e) {
		var doToggle = e.target.dataset.toggle === "popover";
		var doReset = e.target.id === "clearColor";
		var selected = doReset ? this.props.resetColor : e.target.dataset.class;
		var pattern = this.props.cls
			.split(" ")
			.filter(c => !c.startsWith("bg-"))
			.join(" ");

		// hide
		if (doToggle || doReset) {
			this.setState({ display: false });
			if (doToggle) return;
		}
		// show
		else if (!selected) {
			this.setState({ display: true });
			window
				.$(this.ref.current)
				.find("." + this.state.selected)
				.addClass("selected");
			return;
		}
		// select the right color
		window
			.$(this.ref.current)
			.find(".sample.selected")
			.removeClass("selected");
		if (!doReset) e.target.className += " selected";

		// DB change
		var saveValue = doReset ? null : (selected + " " + pattern).trim();
		this.props.handleChange("cls", saveValue);
	}
	render() {
		const { ref: htmlRef, handleClick, handleClose } = this;
		const { cls } = this.props;
		const { display } = this.state;
		const currentSelected = this.currentSelected();
		return (
			<BGSelectPopoverComponent
				{...{ htmlRef, handleClick, handleClose, cls, display, currentSelected }}
			/>
		);
	}
}
