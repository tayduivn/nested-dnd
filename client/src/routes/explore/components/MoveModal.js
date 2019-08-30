import React from "react";

import Modal from "components/Modal";
import { SubmitButton } from "components/Button";

export default class MoveModal extends React.PureComponent {
	handleSave = e => {
		const newUp = parseInt(e.target.moveIndex.value);
		this.props.handleChange({ up: newUp });
		e.preventDefault(0);
		this.props.closeModal();
	};
	render() {
		return (
			<Modal onClose={this.props.closeModal}>
				<Modal.Header>Move</Modal.Header>
				<form onSubmit={this.handleSave}>
					<Modal.Body>
						<label>Parent Index</label>
						<input
							name="moveIndex"
							placeholder="#1234"
							className="form-control"
							defaultValue={this.props.up}
							required
						/>
					</Modal.Body>
					<Modal.Footer>
						<SubmitButton value="Save" />
					</Modal.Footer>
				</form>
			</Modal>
		);
	}
}
