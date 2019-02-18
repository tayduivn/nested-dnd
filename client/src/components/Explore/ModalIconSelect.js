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
		const { category = "icon", handleChange } = this.props;
		return (
			<select value={category} onChange={handleChange} name="category">
				<option value="icon">Icon</option>
				<option value="char">Character</option>
				<option value="img">Image</option>
			</select>
		);
	}
}

const TextBox = ({ value, handleChange }) => (
	<div>
		<input className="form-control" name="value" value={value} onChange={handleChange} />
	</div>
);

const ImageInput = ({ setPreview, value, handleChange }) => (
	<div>
		<button className="btn btn-default" onClick={setPreview}>
			Show to players
		</button>
		<a href="/players-preview">Player view</a>
		<br />
		<input className="form-control" name="value" value={value} onChange={handleChange} />
		<div className="iconSelectModal__img-wrap">
			<img className="iconSelectModal__img" src={value} alt="Preview" />
		</div>
	</div>
);

const ModalBody = ({
	value,
	category,
	index,
	cssClass,
	txt,
	handleChange,
	handleSubmit,
	setPreview = () => {}
}) => (
	<div className="iconSelectModal__body modal-body">
		<button data-dismiss="modal" className="btn btn-success" onMouseDown={handleSubmit}>
			Save
		</button>
		<TypeChanger {...{ category, handleChange }} />
		{category === "img" ? (
			<ImageInput {...{ setPreview, value, handleChange }} />
		) : category === "char" ? (
			<TextBox {...{ value, handleChange }} />
		) : (
			<IconSelect
				status={{ isEnabled: true }}
				saveProperty={handleChange}
				style={{ color: txt }}
				{...{ cssClass, key: index, value, setPreview }}
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
	constructor(props) {
		super(props);
		this.modalRef = React.createRef();
		this.state = {
			value: props.value,
			category: props.category
		};
	}
	handleChange = e => {
		if(typeof e === 'string'){
			this.setState({ value: e });
		}
		else this.setState({ [e.target.name]: e.target.value });
	};
	setPreview = () => {
		if (this.state.category === "img" && this.state.value) {
			sendPlayersPreview({ src: this.state.value });
		}
	};
	handleSubmit = () => {
		this.props.handleChange(this.props.index, "icon", {
			category: this.state.category,
			value: this.state.value
		});
	};
	render() {
		var { cssClass, txt } = this.props;
		const { handleChange, setPreview, handleSubmit } = this;
		const { value, category } = this.state;

		return (
			<div {...MODAL_SETTINGS} ref={this.modalRef}>
				<ModalIconsComponent
					{...{ setPreview, value, category, cssClass, txt }}
					{...{ handleChange, handleSubmit }}
				/>
			</div>
		);
	}
}

export { ModalHeader };
