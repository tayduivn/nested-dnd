import React from "react";

import IconSelect from "components/Form/IconSelect";
import Modal from "components/Modal";
import Button from "components/Button";
import ImageExpand from "components/ImageExpand";

import { sendPlayersPreview } from "store/actions";
import styles from "./ModalIconSelect.module.scss";

function TypeChanger({ kind = "icon", handleChangeEvent }) {
	return (
		<Modal.Select value={kind} onChange={handleChangeEvent} name="kind">
			<option value="icon">Icon</option>
			<option value="video">Video</option>
			<option value="char">Character</option>
			<option value="img">Image</option>
		</Modal.Select>
	);
}

const TextBox = ({ value, handleChangeEvent }) => {
	return <input className="form-control" name="value" value={value} onChange={handleChangeEvent} />;
};

const ImageInput = ({ value, handleChangeEvent }) => {
	return (
		<>
			<input
				type="url"
				className="form-control"
				name="value"
				value={value}
				onChange={handleChangeEvent}
			/>
			<div className={styles.imgWrap}>
				<ImageExpand className={styles.img} src={value} alt="Preview" />
			</div>
		</>
	);
};

const DoHue = ({ doHue, handleChangeEvent }) => {
	return (
		<label className="form-group">
			<div className="switch">
				<input
					id="generatorIsUnique"
					type="checkbox"
					className="switch-input"
					name="doHue"
					checked={doHue}
					onChange={handleChangeEvent}
				/>
				<span className="switch-label" data-on="On" data-off="Off" />
				<span className="switch-handle" />
			</div>
			&nbsp; Color with background
		</label>
	);
};

const VideoInput = ({ doHue, cls, value, handleChangeEvent }) => {
	return (
		<>
			<DoHue {...{ doHue, handleChangeEvent }} />
			<input
				type="url"
				className="form-control"
				name="value"
				value={value}
				onChange={handleChangeEvent}
			/>
			<div className="iconSelectModal__video-wrap video__wrapper">
				<div className={`video__hueOverlay ${doHue ? cls : ""}`} />
				<video controls width="100%" loop preload="true" mute="true">
					<source src={value} type="video/mp4" />
				</video>
			</div>
		</>
	);
};

const ModalIconsComponent = ({
	value,
	kind,
	index,
	cls,
	doHue,
	txt,
	handleChange,
	handleChangeEvent,
	handleSubmit,
	closeModal,
	setPreview = () => {}
}) => (
	<Modal onClose={closeModal} size="medium">
		<TypeChanger {...{ kind, handleChangeEvent }} />
		<Modal.Body>
			{kind === "img" ? (
				<ImageInput {...{ setPreview, value, handleChangeEvent }} />
			) : kind === "video" ? (
				<VideoInput {...{ setPreview, value, handleChangeEvent, cls, doHue }} />
			) : kind === "char" ? (
				<TextBox {...{ value, handleChangeEvent }} />
			) : (
				<IconSelect
					{...{ style: { color: txt }, status: { isEnabled: true } }}
					{...{ cls, key: index, value, setPreview, saveProperty: handleChange }}
				/>
			)}
		</Modal.Body>
		<Modal.Footer>
			{kind === "img" || kind === "video" ? (
				<Button onClick={setPreview}>Show to players</Button>
			) : null}
			<Button onClick={handleSubmit}>Save</Button>
		</Modal.Footer>
	</Modal>
);

export default class IconSelectModal extends React.PureComponent {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value,
			kind: props.kind,
			doHue: props.doHue
		};
	}

	handleChangeEvent = e => {
		this.setState({ [e.target.name]: e.target.value });
	};

	handleChange = data => {
		this.setState(data);
	};

	setPreview = () => {
		if (this.state.value && ["img", "video"].includes(this.state.kind)) {
			sendPlayersPreview({
				src: this.state.value,
				kind: this.state.kind,
				hueOverlay: this.state.doHue ? this.props.cls : ""
			});
		}
	};

	handleSubmit = () => {
		this.props.handleChange({
			icon: {
				kind: this.state.kind,
				value: this.state.value,
				doHue: this.state.doHue
			}
		});
		this.props.closeModal();
	};

	render() {
		var { cls, txt, closeModal } = this.props;
		const { handleChange, setPreview, handleSubmit, handleChangeEvent } = this;
		const { value, kind, doHue } = this.state;

		return (
			<ModalIconsComponent
				{...{ setPreview, value, kind, cls, txt, doHue, closeModal }}
				{...{ handleChange, handleSubmit, handleChangeEvent }}
			/>
		);
	}
}
