import React from 'react';
import { Button, Modal,FormGroup,ControlLabel,FormControl, Radio } from 'react-bootstrap';
import Select from 'react-select';

import thingStore from '../stores/thingStore';
import tableStore from '../stores/tableStore';
import Contain from '../util/Contain';

class SettingsModal extends React.Component {
	constructor(props) {
		super(props);

		this.packMap = {
			"dnd": "../packs/game-icons.json,../packs/nested-dnd-data.json,../packs/dnd.js,../packs/forgotten-realms.json",
			"nested-orteil":"../packs/game-icons.json,../packs/nested-orteil.json,../packs/nested-orteil-extended.json"
		}
		var pack = "custom";
		for(var name in this.packMap){
			if(localStorage.packs === this.packMap[name]){
				pack = name;
			}
		}
		var seed = (props.seed) ? props.seed : "";
		seed = seed.split(">").map((s)=>s.trim());
		var seedOptions = (seed.length) ? this.getSeedContains(seed) : props.seedOptions;

		this.state = {
			pack: pack,
			customPacks: localStorage.packs.replace(/,/g,"\n").replace(/\..\/packs\//g,""),
			seed: seed,
			originalSeed: seed,
			seedOptions: seedOptions
		};

		this.handleChange = this.handleChange.bind(this);
		this.handleChangeSeed = this.handleChangeSeed.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.filterSeedOptions = this.filterSeedOptions.bind(this);
	}

	componentWillReceiveProps(nextProps, nextState){
		if(this.props.seedOptions.length !== nextProps.seedOptions.length){
			var state = {};
			if(!this.state.seed.length){
				state.seedOptions = nextProps.seedOptions;
			}
			if(this.state.originalSeed !== nextProps.seed){
				state.originalSeed = nextProps.seed;
				state.seed = nextProps.seed.split(">").map((s)=>s.trim());
				state.seedOptions = this.getSeedContains(state.seed)
			}
			this.setState(state);
		}
	}

	handleChange(event) {
		if(event.target.name === "pack"){
			this.setState({ seed: "" })
			this.setState({ pack: event.target.value })
		}else	if(event.target.name === "customPacks"){
			this.setState({ customPacks: event.target.value })
		}
	}

	filterSeedOptions(options, filterString, values){
		if(values.length === 0 && this.state.seed.length){
			return this.state.seedOptions;
		}

		return this.state.seedOptions.filter((op) => {
			return op.value.includes(filterString)
		})
	}

	getSeedContains(values){
		if(values.length === 0){
			return this.props.seedOptions;
		}

		var seedOptions = [];
		var lastThing = values[values.length - 1];
		if(lastThing.value)
			lastThing = lastThing.value;

		if(!thingStore.exists(lastThing)){
			return [];
		}

		lastThing = thingStore.get(lastThing);
		if(!lastThing.contains)
			return [];
		
		for(var i = 0; i < lastThing.contains.length; i++){
			var contain = lastThing.contains[i];
			if(tableStore.isRollable(contain)){
				continue;
			} 
			var check = new Contain(contain);
			if(check.makeProb !== 100) continue;

			if(thingStore.exists(check.value)){
				if(check.isEmbedded){
					lastThing.contains.push(...thingStore.get(check.value).contains)
					continue;
				}else
					seedOptions.push({value:check.value, label:check.value});
			}
		}
		return seedOptions;
	}

	handleChangeSeed(values){
		this.setState({ 
			seed: values,
			seedOptions: this.getSeedContains(values)
		});
	}

	handleSubmit(event) {
		if(!this.state.seed.length){
			localStorage.removeItem("seed");
		}else{
			localStorage["seed"] = this.state.seed.map((o)=>(o.value?o.value:o)).join(" > ");
		}

		if(this.state.pack === "custom"){
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
							<Select name="seed" value={this.state.seed} onChange={this.handleChangeSeed}
								multi={true} clearValueText="Use default seed" filterOptions={this.filterSeedOptions}
								options={this.props.seedOptions} />
						</FormGroup>

						<FormGroup>
							<ControlLabel>Pack</ControlLabel>
							<Radio name="pack" value="nested-orteil" checked={(this.state.pack === "nested-orteil") ? true : false} onChange={this.handleChange}>
								Nested 0.3 (<a target="_blank"  rel="noopener noreferrer" href="http://orteil.dashnet.org/nested">source</a>)
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
		this.state = { 
			showModal: false,
			thingNames: [],
			seedOptions: []
		};
	}

	close() {
		this.setState({ showModal: false });
	}

	open(e) {
		e.preventDefault();

		var thingNames = thingStore.getSortedThingNames();
		var seedOptions = thingNames.map( (name) =>{ return {value:name,label:name} });

		this.setState({ 
			seed: localStorage.seed,
			showModal: true,
			thingNames: thingNames,
			seedOptions: seedOptions
		});
	}
	render(){
		return (
			<a onClick={(e) => this.open(e)}>
				<i className="fa fa-gear"/>
				<SettingsModal modal={this} seed={this.state.seed} seedOptions={this.state.seedOptions} thingNames={this.state.thingNames} />
			</a>
		);
	}
}



export default Settings;