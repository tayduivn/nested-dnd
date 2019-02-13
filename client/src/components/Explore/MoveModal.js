import React from "react";

import { ModalHeader } from "./ModalIconSelect";

export default class MoveModal extends React.PureComponent {
	handleSave = e => {
		const newUp = parseInt(e.target.moveIndex.value);
		this.props.handleChange(this.props.index, "up", newUp);
		e.preventDefault(0);
	};
	render() {
		return (
			<div className="modal fade" id="moveModal" tabIndex="-1" role="dialog" aria-hidden="true">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						{ModalHeader}
						<div className="modal-body">
							<form className="form-group" onSubmit={this.handleSave}>
								<label>Parent Index</label>
								<input name="moveIndex" className="form-control" defaultValue={this.props.up} />
								<button className="btn btn-primary" data-dismiss="modal">
									Cancel
								</button>
								<input type="submit" className="btn btn-success" value="Save" />
							</form>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
