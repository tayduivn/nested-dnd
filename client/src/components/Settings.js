import React from 'react';
import { Button, Modal,FormGroup,ControlLabel,FormControl, Radio } from 'react-bootstrap';
import Select from 'react-select';

import thingStore from '../stores/thingStore';
import tableStore from '../stores/tableStore';
import Contain from '../util/Contain';
import PackLoader from '../util/PackLoader';

class SettingsModal extends React.Component {
	constructor(props) {
		super(props);

		var pack = "custom";
		for(var name in PackLoader.packmap){
			if(localStorage.packs && localStorage.packs === PackLoader.packmap[name]){
				pack = name;
			}
		}

		var seed = (localStorage.seed) ? localStorage.seed : "";
		seed = seed.split(">").map((s)=>s.trim());

		this.state = {
			pack: pack,
			seed: seed,
			originalSeed: seed,
			customPacks: (localStorage.packs) ? localStorage.packs.replace(/,/g,"\n") : "",
			seedOptions: []
		};

		var _this = this;
		PackLoader.load(function(){
			_this.setState(_this.getSeedContains(seed));
		});

		this.handleChange = this.handleChange.bind(this);
		this.handleChangeSeed = this.handleChangeSeed.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.filterSeedOptions = this.filterSeedOptions.bind(this);
	}

	shouldComponentUpdate(nextProps, nextState){
		return true;
	}

	componentWillReceiveProps(nextProps, nextState){
		if(!this.state.seed.length && nextProps.allThingOptions !== this.props.allThingOptions){
			this.setState({
				//initialOptions: this.getInitialOptions(nextState.seed),
				seedOptions: nextProps.allThingOptions
			});
		}
	}

	handleChange(event) {
		if(event.target.name === "pack"){
			this.setState({ seed: "" });
			this.setState({ pack: event.target.value });
		}else	if(event.target.name === "customPacks"){
			this.setState({ customPacks: event.target.value });
		}
	}

	filterSeedOptions(options, filterString, values){
		if(values.length === 0 && this.state.seed.length){
			return this.state.seedOptions;
		}

		var unfoundValues = [].concat(values);

		return this.state.seedOptions.filter((op) => {
			var index = unfoundValues.findIndex((option) => option.value === op.value);
			var selected = index !== -1;
			if(selected){
				unfoundValues.splice(index,1);
			}
			return !selected && op.value.includes(filterString);
		});
	}

	getSeedContains(seed){

		//set clearableValue
		if(typeof seed[0] === "string"){
			seed = seed.map((name, index)=>({
				value:name,
				label:name,
				clearableValue: (seed.length === 1 || index === seed.length-1)
			}));
		}else{
			seed = seed.map((option, index) => (
				{...option, clearableValue: (seed.length === 1 || index === seed.length-1) }
			));
		}

		if(seed.length === 0){
			return {
				seedOptions: this.props.allThingOptions,
				seed: seed
			};
		}

		var seedOptions = [].concat(seed);

		var lastThing = seed[seed.length - 1];
		if(lastThing.value)
			lastThing = lastThing.value;

		if(!lastThing || !thingStore.exists(lastThing)){
			return [];
		}

		var contains = thingStore.get(lastThing).contains;
		if(!contains) return [];
		contains = [...contains]; //copy it

		for(var i = 0; i < contains.length; i++){
			var contain = contains[i];
			if(!contain) continue;

			if(contain.constructor.name !== "Object"){
				if(tableStore.isRollable(contain)){
					continue;
				} 
				var check = new Contain(contain);
				if(check.makeProb !== 100) continue;
				if(check.value && thingStore.exists(check.value)){
					if(check.isEmbedded){
						contains.push(...thingStore.get(check.value).contains);
						continue;
					}else{
						seedOptions.push({value:check.value, label:check.value});
					}
				}
			}
			else{ //embedded object
				//do nothing?
			}			
		}
		return {
			seedOptions: seedOptions,
			seed: seed
		};
	}

	handleChangeSeed(values){
		this.setState(this.getSeedContains(values));
	}

	handleSubmit(event) {
		var confirm = true;
		if(localStorage["newPack"]){
			confirm = window.confirm("This will clear your changes in the Pack Editor. Are you sure?");
		}
		if(!confirm) return;
		delete localStorage["newPack"];

		if(!this.state.seed.length){
			localStorage.removeItem("seed");
		}else{
			localStorage["seed"] = this.state.seed.map((o)=>(o.value?o.value:o)).join(" > ");
		}

		if(this.state.pack === "custom"){
			var packs = this.state.customPacks.split("\n");
			localStorage["packs"] = packs.join(",");
		}else{
			localStorage["packs"] = PackLoader.packmap[this.state.pack];
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
								options={ this.state.seedOptions } />
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
							<FormControl componentClass="textarea" rows="7" name="customPacks" value={this.state.customPacks} onChange={this.handleChange}  />
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
			allThingOptions: []
		};
	}

	close() {
		this.setState({ showModal: false });
	}

	open(e) {
		e.preventDefault();
		var state = {
			showModal: true
		};

		if(!this.state.thingNames.equals(thingStore.sortedThingNames)){
			state.thingNames = thingStore.sortedThingNames;
			state.allThingOptions = state.thingNames.map( (name) =>{ return {value:name,label:name}; });
		}

		this.setState(state);
	}
	render(){
		return (
			<a onClick={(e) => this.open(e)}>
				<i className="fa fa-gear"/> Settings
				<SettingsModal modal={this} seed={this.state.seed} allThingOptions={this.state.allThingOptions} />
			</a>
		);
	}
}



export default Settings;