import React from "react";

import IconSelect from "../Form/IconSelect";

class TypeChanger extends React.PureComponent {
	render() {
		const { type, handleChangeType } = this.props;
		return (
			<select value={type} className="input-transparent" onChange={handleChangeType}>
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

const ImageInput = ({ setPreview, icon, newValue }) => (
	<div>
		<button className="btn btn-default" onClick={setPreview}>
			Show to players
		</button>
		<a href="/players-preview">Player view</a>
		<br />
		<img src={icon} alt="Preview" />
		<input
			className="form-control"
			value={newValue}
			onChange={e => this.handleChange(e.target.value)}
		/>
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
	<div className="modal-body">
		<TypeChanger {...{ type, handleChangeType }} />
		{useImg ? (
			<ImageInput {...{ setPreview, icon, newValue }} />
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
	<div className="modal-header">
		<button type="button" className="close" data-dismiss="modal" aria-label="Close">
			<span aria-hidden="true">&times;</span>
		</button>
	</div>
);

const ModalIconsComponent = props => (
	<div className="modal fade" id="iconSelectModal" tabIndex="-1" role="dialog" aria-hidden="true">
		<div className="modal-dialog" role="document">
			<div className="modal-content">
				{ModalHeader}
				<ModalBody {...props} />
			</div>
		</div>
	</div>
);

export default class IconSelectModal extends React.PureComponent {
	state = {
		newValue: null,
		useImg: null,
		showTextBox: null
	};
	componentDidMount() {
		const modal = document.getElementById("iconSelectModal");

		modal.addEventListener("hide.bs.modal", this.handleClose);
		modal.addEventListener("show.bs.modal", this.handleOpen);
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
		this.props.sendPlayersPreview(icon);
	};
	render() {
		var { icon, cssClass, txt } = this.props;
		const { handleChange, handleChangeType, setPreview } = this;
		const { useImg, newValue, showTextBox } = this.state;
		var type = this.state.showTextBox ? "text" : !!useImg;

		return (
			<ModalIconsComponent
				{...{
					handleChange,
					handleChangeType,
					setPreview,
					useImg,
					type,
					icon,
					cssClass,
					txt,
					newValue,
					showTextBox
				}}
			/>
		);
	}
}

export { ModalHeader };
