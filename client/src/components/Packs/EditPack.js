import React, { Component } from "react";
import {
	FormGroup, 
	ControlLabel, 
	FormControl,
	Checkbox, 
	Button
} from "react-bootstrap";
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
					<FormGroup>
						<ControlLabel>Name</ControlLabel>
						<FormControl defaultValue={pack.name} required name="name" />
					</FormGroup>

					{/* --------- Public ------------ */}
					<Checkbox defaultChecked={pack.public} name="public">Make Public</Checkbox>
					<FormGroup>
						<ControlLabel>URL</ControlLabel>
						<FormControl defaultValue={pack.url} name="url" />
					</FormGroup>

					{/* --------- Default Seed ------------ */}
					<FormGroup>
						<ControlLabel>Default Seed</ControlLabel>
						<FormControl defaultValue={pack.defaultSeed} name="defaultSeed" />
					</FormGroup>

					{/* --------- Dependencies: TODO ------------ */}

					<Button type="submit" bsStyle="primary">Save</Button>


					<Button bsStyle="danger" onClick={ this.handleDelete }>Delete Pack</Button>
				</form>
			</div>
		);
	}
}
