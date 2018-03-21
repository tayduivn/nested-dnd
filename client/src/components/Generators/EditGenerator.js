import React, { Component } from "react";
import PropTypes from "prop-types";
import DB from '../../actions/CRUDAction';

export default class EditGenerator extends Component {
	static get propTypes(){
		return {
			"generator": PropTypes.object,
			"packid": PropTypes.string.isRequired,
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
		const isCreate = !this.props.generator;
		var formData = new FormData(e.target);
		const history = this.props.history;
		const url = "pack/"+this.props.packid+"/generator"

		if(isCreate){
			DB.create(url, formData, function(updatedGen){
				if(updatedGen)
					history.push('/'+url+'/'+updatedGen._id);
			});
		}
		else{
			DB.set(url, this.props.generator._id, formData, (updatedGen) => {
				if(updatedGen)
					history.push('/'+url+'/'+updatedGen._id);
			})
		}
	}
	handleDelete(){
		DB.delete("generator", this.props.generator._id, () => {
			this.props.history.push('/packs/'+this.props.packid);
		});
	}
	render() {
		const isCreate = !this.props.generator;
		const gen = this.props.generator || {};

		return (
			<div className="container">
				<h1>{ isCreate ? "Create" : "Edit"} Generator</h1>
				<form onSubmit={this.handleSubmit}>

					{/* --------- Name ------------ */}
					<div className="form-group">
						<label>Name</label>
						<input value={gen.isa} required name="isa" />
					</div>

					<button type="submit" className="btn btn-primary">Save</button>

					<button className="btn btn-danger" onClick={ this.handleDelete }>Delete Generator</button>
				</form>
			</div>
		);
	}
}
