import React from "react";

import { ModalHeader } from "./ModalIconSelect";

export default class MoveModal extends React.PureComponent {
	componentDidMount() {
		document.getElementById("moveModal").addEventListener("hide.bs.modal", this.handleClose);
	}
	handleClose = () => {
		const newUp = document.getElementById("moveIndex").value;
		this.props.handleChange(this.props.index, "up", newUp);
	};
	render() {
		return (
			<div className="modal fade" id="moveModal" tabIndex="-1" role="dialog" aria-hidden="true">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						{ModalHeader}
						<div className="modal-body">
							<div className="form-group">
								<label>Parent Index</label>
								<input className="form-control" id="moveIndex" defaultValue={this.props.up} />
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
