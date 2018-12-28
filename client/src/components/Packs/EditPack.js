import React, { Component } from "react";
import PropTypes from "prop-types";

import DB from "../../actions/CRUDAction";

const Form = ({
	isCreate,
	name,
	public: isPublic,
	url,
	seed,
	font,
	handleSubmit,
	handleDelete
}) => (
	<div className="main">
		<div className="container mt-5 loginForm">
			<h1>{!isCreate ? "Create" : "Edit"} Pack</h1>
			<form onSubmit={handleSubmit}>
				{/* --------- Name ------------ */}
				<div className="form-group">
					<label>Name</label>
					<input
						defaultValue={name}
						required
						name="name"
						className="form-control"
					/>
				</div>
				{/* --------- Public ------------ */}
				<div className="form-check">
					<label className="form-check-label">
						<input
							type="checkbox"
							defaultChecked={isPublic}
							name="public"
							className="form-check-input"
						/>
						Make Public
					</label>
				</div>
				<div className="form-group">
					<label>URL</label>
					<input defaultValue={url} name="url" className="form-control" />
				</div>
				{/* --------- Font ------------ */}
				<div className="form-group">
					<label>Font</label>
					<input defaultValue={font} name="font" className="form-control" />
				</div>
				{/* --------- Default Seed ------------ */}
				<div className="form-group">
					<label>Default Seed</label>
					<input defaultValue={seed} name="seed" className="form-control" />
				</div>
				{/* --------- Dependencies: TODO ------------ */}
				<button type="submit" className="btn btn-primary">
					Save
				</button>
				&nbsp;&nbsp;
				{!isCreate ? null : (
					<button
						type="button"
						className="btn btn-outline-danger"
						onClick={handleDelete}
					>
						<i className="fas fa-trash" /> Delete Pack
					</button>
				)}
			</form>
		</div>
	</div>
);

export default class EditPack extends Component {
	static propTypes = {
		pack: PropTypes.object,
		history: PropTypes.object.isRequired
	};
	handleSubmit = e => {
		e.preventDefault();
		const isCreate = !this.props.pack;
		var formData = new FormData(e.target);
		const history = this.props.history;

		if (formData.get("public") === "on") {
			formData.set("public", true);
		} else {
			formData.set("public", false);
		}

		if (isCreate) {
			DB.create("packs", formData).then(({ data: updatedPack, error }) => {
				history.push("/packs/" + updatedPack._id);
			});
		} else {
			DB.set("packs", this.props.pack._id, formData).then(
				({ data: updatedPack, error }) => {
					history.push("/packs/" + updatedPack._id);
				}
			);
		}
	};
	handleDelete = () => {
		var confirmed = window.confirm(
			"Are you sure you want to delete this pack?"
		);
		if (!confirmed) return;

		DB.delete("packs", this.props.pack._id, () => {
			this.props.history.push("/packs");
		});
	};
	render() {
		return (
			<Form
				{...this.props.pack}
				isCreate={!!this.props.pack}
				handleSubmit={this.handleSubmit}
				handleDelete={this.handleDelete}
			/>
		);
	}
}
