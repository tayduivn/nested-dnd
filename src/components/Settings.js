import React, { Component } from 'react';
import { Button, Modal,FormGroup,ControlLabel,FormControl, Radio } from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';

class SettingsModal extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			pack: "custom",
			customPacks: localStorage.packs.replace(/,/g,"\n").replace(/\..\/packs\//g,""),
			seed:localStorage.seed
		};

		this.packMap = {
			"dnd": "../packs/game-icons.json,../packs/nested-dnd-data.json,../packs/dnd.js,../packs/forgotten-realms.json",
			"nested-orteil":"../packs/game-icons.json,../packs/nested-orteil.json,../packs/nested-orteil-extended.json"
		}

		for(var name in this.packMap){
			if(localStorage.packs === this.packMap[name]){
				this.state.pack = name;
			}
		}

		this.handleChange = this.handleChange.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
	}

	handleChange(event) {
		if(event.target.name == "seed"){
			this.setState({ seed: event.target.value })
		}else	if(event.target.name == "pack"){
			this.setState({ seed: "" })
			this.setState({ pack: event.target.value })
		}else	if(event.target.name == "customPacks"){
			this.setState({ customPacks: event.target.value })
		}
	}

	handleSubmit(event) {
		localStorage["seed"] = this.state.seed;

		if(this.state.pack == "custom"){
			var packs = this.state.customPacks.split("\n");
			packs.forEach(function(str, index){
				if(!str.startsWith("http"))
					packs[index] = "./packs/"+str
			});
			localStorage["packs"] = packs.join(",");
		}else{
			localStorage["packs"] = this.packMap[this.state.pack];
		}
		
		this.props.modal.close();
		event.preventDefault();
		window.location.reload();
	}

	render() {
		return (
			<Modal show={this.props.modal.state.showModal} 
				onHide={() => this.props.modal.close()}>
				<Modal.Header>
					<Modal.Title>Settings</Modal.Title>
				</Modal.Header>
				<form onSubmit={this.handleSubmit}>
					<Modal.Body>

						<FormGroup controlId="seed">
							<ControlLabel>Seed</ControlLabel>
							<FormControl type="text" name="seed" value={this.state.seed} onChange={this.handleChange}  />
						</FormGroup>

						<FormGroup>
							<ControlLabel>Pack</ControlLabel>
							<Radio name="pack" value="nested-orteil" checked={(this.state.pack === "nested-orteil") ? true : false} onChange={this.handleChange}>
								Nested 0.3 (<a target="_blank" href="http://orteil.dashnet.org/nested">source</a>)
							</Radio>
							<Radio name="pack" value="dnd" checked={(this.state.pack === "dnd") ? true : false} onChange={this.handleChange}>
								Dungeons & Dragons
							</Radio>
							<Radio name="pack" value="custom" checked={(this.state.pack === "custom") ? true : false} onChange={this.handleChange}>
								Custom
							</Radio>
						</FormGroup>

						<FormGroup controlId="packs" style={{display: (this.state.pack === "custom") ? "block":"none"}}>
							<ControlLabel>Custom Packs</ControlLabel>
							<FormControl componentClass="textarea" name="customPacks" value={this.state.customPacks} onChange={this.handleChange}  />
						</FormGroup>

					</Modal.Body>
					<Modal.Footer>
						<Button onClick={() => this.props.modal.close()}>Close</Button>
						<Button bsStyle="primary" type="submit">Save changes</Button>
					</Modal.Footer>
				</form>
			</Modal>
		);
	}
}

class Settings extends React.Component{
	constructor(props){
		super(props);
		this.state = { showModal: false };
	}

	close() {
		this.setState({ showModal: false });
	}

	open(e) {
		e.preventDefault();
		this.setState({ showModal: true });
	}
	render(){
		return (
			<a href="#" onClick={(e) => this.open(e)}>
				<i className="fa fa-gear"/>
				<SettingsModal modal={this} />
			</a>
		);
	}
}



export default Settings;