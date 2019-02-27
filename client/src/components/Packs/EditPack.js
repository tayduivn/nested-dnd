import React, { Component } from "react";
import PropTypes from "prop-types";

import DB from "../../actions/CRUDAction";

import { connect } from "react-redux";

import actions from "./actions";

class Name extends React.PureComponent {
	render() {
		return (
			<div className="form-group">
				<label>Name</label>
				<input defaultValue={this.props.name} required name="name" className="form-control" />
			</div>
		);
	}
}

class Public extends React.PureComponent {
	render() {
		return (
			<>
				<div className="form-check">
					<label className="form-check-label">
						<input
							type="checkbox"
							defaultChecked={this.props.isPublic}
							name="public"
							className="form-check-input"
						/>
						Make Public
					</label>
				</div>
				<div className="form-group">
					<label>URL</label>
					<input defaultValue={this.props.url} name="url" className="form-control" />
				</div>
			</>
		);
	}
}

class Dependencies extends React.PureComponent {
	render() {
		return (
			<>
				<button type="submit" className="btn btn-light">
					Save
				</button>
				&nbsp;&nbsp;
				{!this.props.isCreate ? null : (
					<button
						type="button"
						className="btn btn-outline-danger"
						onClick={this.props.handleDelete}
					>
						<i className="fas fa-trash" /> Delete Pack
					</button>
				)}
			</>
		);
	}
}

class Form extends React.PureComponent {
	render() {
		const { isCreate, seed, font, handleSubmit, handleDelete } = this.props;
		return (
			<div className="main">
				<div className="container mt-5 loginForm">
					<h1>{isCreate ? "Create" : "Edit"} Pack</h1>
					<form onSubmit={handleSubmit}>
						<Name name={this.props.name} />
						<Public isPublic={this.props.isPublic} url={this.props.url} />
						<div className="form-group">
							<label>Font</label>
							<input defaultValue={font} name="font" className="form-control" />
						</div>
						<div className="form-group">
							<label>Default Seed</label>
							<input defaultValue={seed} name="seed" className="form-control" />
						</div>
						<Dependencies {...{ isCreate, handleDelete }} />
					</form>
				</div>
			</div>
		);
	}
}

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
