import React, { Component } from "react";
import PropTypes from "prop-types";

import DB from "../../actions/CRUDAction";

import { connect } from "react-redux";

import actions from "./actions";

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
			<h1>{isCreate ? "Create" : "Edit"} Pack</h1>
			<form onSubmit={handleSubmit}>
				{/* --------- Name ------------ */}
				<div className="form-group">
					<label>Name</label>
					<input defaultValue={name} required name="name" className="form-control" />
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
					<button type="button" className="btn btn-outline-danger" onClick={handleDelete}>
						<i className="fas fa-trash" /> Delete Pack
					</button>
				)}
			</form>
		</div>
	</div>
);

class EditPack extends Component {
	static propTypes = {
		pack: PropTypes.object,
		history: PropTypes.object.isRequired
	};
	constructor(props) {
		super(props);
		this.props.fetchPack();
	}
	handleSubmit = e => {
		e.preventDefault();
		const isCreate = this.props.isCreate;
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
			DB.set("packs", this.props.pack._id, formData).then(({ data: updatedPack, error }) => {
				history.push("/packs/" + updatedPack._id);
			});
		}
	};
	handleDelete = () => {
		var confirmed = window.confirm("Are you sure you want to delete this pack?");
		if (!confirmed) return;

		DB.delete("packs", this.props.pack._id, () => {
			this.props.history.push("/packs");
		});
	};
	render() {
		return (
			<Form
				{...this.props.pack}
				isCreate={this.props.isCreate}
				handleSubmit={this.handleSubmit}
				handleDelete={this.handleDelete}
			/>
		);
	}
}

const EditPackConnect = connect(
	function mapStateToProps(state, ownProps) {
		const packUrl = ownProps.match.params.pack;
		return {
			isCreate: !ownProps.match.params.pack,
			pack: state.packs.byUrl[packUrl] || {}
		};
	},
	function mapDispatchToProps(dispatch, ownProps) {
		const packUrl = ownProps.match.params.pack;
		return {
			fetchPack: () => dispatch(actions.fetchPack(dispatch, packUrl))
		};
	}
)(EditPack);
export default EditPackConnect;
