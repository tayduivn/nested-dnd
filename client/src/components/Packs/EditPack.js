import React, { Component } from "react";
import PropTypes from "prop-types";

import DB from '../../actions/CRUDAction';


export default class EditPack extends Component {
	static get propTypes(){
		return {
			"pack": PropTypes.object,
			"history": PropTypes.object.isRequired
		}
	}
	constructor(){
		super();
		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleDelete = this.handleDelete.bind(this);
	}
	handleSubmit(e){
		e.preventDefault();
		const isCreate = !this.props.pack;
		var formData = new FormData(e.target);
		const history = this.props.history;

		if(formData.get("public") === "on"){
			formData.set("public",true)
		}else{
			formData.set("public",false)
		}

		if(isCreate){
			DB.create("pack", formData, function(updatedPack){
				history.push('/packs/'+updatedPack._id);
			});
		}
		else{
			DB.set("pack", this.props.pack._id, formData, (updatedPack) => {
				history.push('/packs/'+updatedPack._id);
			})
		}
	}
	handleDelete(){
		DB.delete("pack", this.props.pack._id, () => {
			this.props.history.push('/packs');
		});
	}
	render() {
		const isCreate = !this.props.pack;
		const pack = this.props.pack || {};

		return (
			<div className="container">
				<h1>{ isCreate ? "Create" : "Edit"} Pack</h1>
				<form onSubmit={this.handleSubmit}>

					{/* --------- Name ------------ */}
					<div class="form-group">
						<label>Name</label>
						<input value={pack.name} required name="name" />
					</div>

					{/* --------- Public ------------ */}
					<input type="checkbox" checked={pack.public} name="public">Make Public</input>
					<div class="form-group">
						<label>URL</label>
						<input vlue={pack.url} name="url" />
					</div>

					{/* --------- Default Seed ------------ */}
					<div class="form-group">
						<label>Default Seed</label>
						<input value={pack.defaultSeed} name="defaultSeed" />
					</div>

					{/* --------- Dependencies: TODO ------------ */}

					<button type="submit" className="btn btn-primary">Save</button>


					<button className="btn btn-danger" onClick={ this.handleDelete }>Delete Pack</button>
				</form>
			</div>
		);
	}
}
