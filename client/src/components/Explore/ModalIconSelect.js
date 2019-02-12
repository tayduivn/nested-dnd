import React from "react";

import IconSelect from "../Form/IconSelect";

import "./ModalIconSelect.css";

import { sendPlayersPreview } from "../../actions/WebSocketAction";

const MODAL_SETTINGS = {
	id: "iconSelectModal",
	className: "iconSelectModal modal fade",
	tabIndex: "-1",
	role: "dialog",
	"aria-hidden": "true"
};

class TypeChanger extends React.PureComponent {
	render() {
		const { type, handleChangeType } = this.props;
		return (
			<select value={type} onChange={handleChangeType}>
				<option value={false}>Icon</option>
				<option value="text">Text</option>
				<option value={true}>Image</option>
			</select>
		);
	}
}

const TextBox = ({ newValue, handleChange }) => (
	<div>
		<input className="form-control" value={newValue} onChange={e => handleChange(e.target.value)} />
	</div>
);

const ImageInput = ({ setPreview, icon, newValue, handleChange }) => (
	<div>
		<button className="btn btn-default" onClick={setPreview}>
			Show to players
		</button>
		<a href="/players-preview">Player view</a>
		<br />
		<input className="form-control" value={newValue} onChange={e => handleChange(e.target.value)} />
		<div className="iconSelectModal__img-wrap">
			<img className="iconSelectModal__img" src={icon} alt="Preview" />
		</div>
	</div>
);

const ModalBody = ({
	type,
	useImg,
	icon,
	index,
	cssClass,
	txt,
	handleChange,
	handleChangeType,
	setPreview = () => {},
	newValue,
	showTextBox
}) => (
	<div className="iconSelectModal__body modal-body">
		<TypeChanger {...{ type, handleChangeType }} />
		{useImg ? (
			<ImageInput {...{ setPreview, icon, newValue, handleChange }} />
		) : showTextBox ? (
			<TextBox {...{ newValue, handleChange }} />
		) : (
			<IconSelect
				status={{ isEnabled: true }}
				saveProperty={handleChange}
				style={{ color: txt }}
				{...{ cssClass, key: index, value: newValue, setPreview }}
			/>
		)}
	</div>
);

const ModalHeader = (
	<div className="iconSelectModal__header modal-header">
		<button
			type="button"
			className="iconSelectModal__close close"
			data-dismiss="modal"
			aria-label="Close"
		>
			<span aria-hidden="true">&times;</span>
		</button>
	</div>
);

const ModalIconsComponent = props => (
	<div className="iconSelectModal__dialog modal-dialog" role="document">
		<div className="iconSelectModal__content modal-content">
			{ModalHeader}
			<ModalBody {...props} />
		</div>
	</div>
);

export default class IconSelectModal extends React.PureComponent {
	state = {
		newValue: null,
		useImg: null,
		showTextBox: null
	};
	constructor(props) {
		super(props);
		this.modalRef = React.createRef();
	}
	componentDidMount() {
		const modal = document.getElementById("iconSelectModal");

		window.$(modal).on("hide.bs.modal", this.handleClose);
		window.$(modal).on("show.bs.modal", this.handleOpen);
	}
	handleChange = value => {
		this.setState({ newValue: value });
	};
	handleChangeType = e => {
		this.setState({
			useImg: e.target.value === "true",
			showTextBox: e.target.value === "text",
			newValue: ""
		});
	};
	handleOpen = () => {
		var icon = this.props.icon || "";

		this.setState({
			useImg: !(icon.startsWith("fa") || icon.startsWith("svg ")),
			showTextBox: icon.startsWith("text "),
			newValue: icon.replace("text ", "")
		});
	};
	handleClose = () => {
		if (this.state.newValue !== null) {
			var newValue = this.state.newValue;
			if (this.state.showTextBox) newValue = "text " + newValue;
			this.props.handleChange(this.props.index, "icon", newValue);
		}

		if (this.state.useImg !== null)
			this.props.handleChange(this.props.index, "useImg", this.state.useImg);

		this.setState({ newValue: null, useImg: null });
	};
	setPreview = () => {
		var icon = this.state.newValue !== null ? this.state.newValue : this.props.icon;
		sendPlayersPreview({ src: icon });
	};
	render() {
		var { icon, cssClass, txt } = this.props;
		const { handleChange, handleChangeType, setPreview } = this;
		const { useImg, newValue, showTextBox } = this.state;
		var type = this.state.showTextBox ? "text" : !!useImg;

		return (
			<div {...MODAL_SETTINGS} ref={this.modalRef}>
				<ModalIconsComponent
					{...{ setPreview, useImg, type, icon, cssClass, txt, newValue, showTextBox }}
					{...{ handleChange, handleChangeType }}
				/>
			</div>
		);
	}
}

export { ModalHeader };
