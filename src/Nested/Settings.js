import React, { Component } from 'react';
import { Button, Modal,FormGroup,ControlLabel,FormControl } from 'react-bootstrap';
import Autosuggest from 'react-autosuggest';

class SettingsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    	packs: localStorage.packs.replace(/,/g,"\n").replace(/\.\/packs\//g,""),
    	seed:localStorage.seed
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleChange(event) {
  	if(event.target.id == "seed"){
  		this.setState({ seed: event.target.value })
  	}else	if(event.target.id == "packs"){
  		this.setState({ packs: event.target.value })
  	}
  }

  handleSubmit(event) {
  	localStorage["seed"] = this.state.seed;
  	var packs = this.state.packs.split("\n");
  	packs.forEach(function(str, index){
  		if(!str.startsWith("http"))
  			packs[index] = "./packs/"+str
  	});
  	localStorage["packs"] = packs.join(",");
  	this.props.modal.close();
    event.preventDefault();
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
							<FormControl type="text" id="seed" value={this.state.seed} onChange={this.handleChange}  />
						</FormGroup>

						<FormGroup controlId="packs">
							<ControlLabel>Packs</ControlLabel>
							<FormControl componentClass="textarea" id="packs" value={this.state.packs} onChange={this.handleChange}  />
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

  open() {
    this.setState({ showModal: true });
  }
	render(){
		return (
			<div className="static-modal">

			<Button bsSize="large"
          onClick={() => this.open()}>
          <i className="fa fa-gear"/>
        </Button>
     
		    <SettingsModal modal={this} />
		    
		  </div>
		);
	}
}



export default Settings;