import React from 'react';
import { Button, Row, Col, ButtonToolbar } from 'react-bootstrap';

import instanceStore from '../../stores/instanceStore';
import thingStore from '../../stores/thingStore';
import tableStore from '../../stores/tableStore';

import NameInput from './NameInput'
import IsASelect from './IsASelect'
import CategoryTabs from './CategoryTabs'

import Import from '../../actions/LegacyImportAction'


const DEBUG = false;

export default class ThingView extends React.Component{
	constructor(props){
		super(props);

		this.validation = {};

		this.state ={
			isValid: false,
			instance: this._createPreview(props.thingID)
		}
		this.handleSave = this.handleSave.bind(this);		
		this.handleDelete = this.handleDelete.bind(this);
		this.validate = this.validate.bind(this);
		this.getStatus = this.getStatus.bind(this);
		this.setPreview = this.setPreview.bind(this);
		this.handleImport = this.handleImport.bind(this);
	}

	shouldComponentUpdate(nextProps, nextState){
		var changed = this.props.thingID !== nextProps.thingID
			|| !Object.values(this.state).equals(Object.values(nextState))
			|| !Object.values(this.props.thing).equals(Object.values(nextProps.thing));
		return changed;
	}

	componentWillReceiveProps(nextProps){
		if(DEBUG){
			console.log("* Acheron background: "+thingStore.get("Acheron").background);
		}
		if(DEBUG) console.log("\t ThingView.componentWillReceiveProps")

		var instance;

		//if displaying a thing
		if(!nextProps.thing) 
			return;

		//switching to a new thing
		if(this.props.thing && this.props.thingID !== nextProps.thingID){
			if(this.state.isValid && Object.keys(this.validation).length){
				this.handleSave();
			}
			this.validation = {};

			instance = this._createPreview(nextProps.thingID);
			this.setState({instance:instance});
		}

		//same thing, check for updates
		else if(nextProps.thing._updatedProps){
			//set validation state to success by default if isUpdated
			//children will call back to validate if invalid
			Object.keys(this.validation).forEach((prop) => {  //remove
				if(!nextProps.thing._updatedProps.includes(prop))
					delete this.validation[prop];
			})
			nextProps.thing._updatedProps.forEach((prop) => this.validation[prop] = true); //add
			this._setStateIsValid();

			instance = this._createPreview(nextProps.thingID);
			this.setState({instance:instance});
		}
	}
	//need to clean up invalid stuff
	componentWillUnmount(){
		if(DEBUG) console.log("ThingView.componentWillUnmount -- isValid: "+this.state.isValid)
		if(!this.state.isValid){
			this._revertToValid();
		}
		if(this.state.instance){
			instanceStore.delete(this.state.instance);
		}
	}

	_createPreview(thingID){
		if(this.state && this.state.instance){
			instanceStore.delete(this.state.instance);
		}
		
		if(!thingID) return null;

		var instance;
		try{
			instance = instanceStore.add(thingID);	
			try{
				instance.name = tableStore.roll(JSON.parse(instance.thing.namegen));
			}catch(e){}
		}catch(e){
			console.error(e); // handle render error
		}
		return instance;
	}

	_revertToValid(){
		for(var property in this.validation){
			//if invalid, reset the value to default
			if(!this.validation[property]){
				if(DEBUG) console.log("\t\t ThingView._revertToValid -- reverting "+property)
				delete this.validation[property];
				this.props.updateThing(property, undefined, true);
			}
		}
	}

	_setStateIsValid(){
		var isValid = Object.keys(this.validation).length && Object.values(this.validation).filter(val=>!val).length === 0
		if(DEBUG) console.log("\t\t isValid: "+isValid);

		if(isValid !== this.state.isValid){
			this.setState({ 
				isValid: isValid
			});
		}
	}


	validate(property, validationState){
		if(DEBUG) console.log("ThingView.validate: "+property+": "+validationState);

		if(validationState == null){
			delete this.validation[property];
		}
		else{
			this.validation = { ...this.validation, [property]: validationState !== "error" };
		}
		this._setStateIsValid();
	}

	setPreview(property, value){
		if(property === "background") property = "cssClass"
		this.setState(prevState => ({
			instance: {...prevState.instance, [property]: value } 
		})); 
	}

	handleSave(thingName){
		if(DEBUG) {
			console.log("\t ThingView.handleSave "+thingName);
		}

		//adding a new thing
		if(thingName && typeof thingName === "string" && thingName !== this.props.thingName){
			return this.props.saveThing(thingName);
		}

		if(!this.state.isValid) { 
			if(Object.keys(this.validation).length)// should not be able to get here
				throw new Error("ThingView: FORM IS INVALID");
			else //not updated
				return;
		}

		this.validation = {};
		this.setState({ 
			isValid: false
		});

		//need to pass initial name so can save on thing switching
		this.props.saveThing(this.props.thingID);
	}

	handleDelete(){
		if(DEBUG) console.log("ThingView.handleDelete");
		this.props.saveThing(this.props.thingID, true);
	}

	handleImport(){
		Import.oneThing(this.props.thing);
	}
	
	getStatus(property){
		var value = this.props.thing[property];
		var valBeforeNewPack = this.props.thing.originalOptions[property]; // after the pack files were loaded
		var valInNewPack = this.props.newPack && this.props.newPack[property]; 

		var isUpdated = this.props.thing._updatedProps.includes(property);

		if(property === "contains" && value){
			var currentSave = valInNewPack || valBeforeNewPack || [];
			var sameNum = value.length === currentSave.length;
			currentSave = [...currentSave];

			isUpdated = value.map((contain, index) => {
				if(sameNum){
					return currentSave[index] !== contain;
				}else{
					var i = currentSave.indexOf(contain);
					if(i !== -1) currentSave.splice(i,1);
					
					return (i === -1)
				}
			});
		}

		// stringify to compare
		try{ value = JSON.parse(value) }catch(e){} // parse if first if possible
		value = (typeof value === "string") ? value : JSON.stringify(value);
		valBeforeNewPack = (typeof valBeforeNewPack === "string") ? valBeforeNewPack : JSON.stringify(valBeforeNewPack);


		// if it wasn't updated, enable if it wasn't set by isa
		var isEnabled = (isUpdated) ? true : (valInNewPack !== undefined) // set in new pack
			|| (valBeforeNewPack !== undefined) //set in pack
			|| false;

		//if updated and different from the original pack files 
		var isClearable = (value !== valBeforeNewPack); 

		return { isUpdated, isEnabled, isClearable };
	}

	render(){
		if(!this.props.thingID)
			return <p></p>;

		const isUpdated = Object.keys(this.validation).length > 0;
		const isaStatus = this.getStatus("isa");
		const nameUpdated = this.getStatus("name").isUpdated
		const originalName = this.props.thing.originalOptions.name;

		if(DEBUG) {
			console.log("ThingView RENDER");
			console.log("\t validation: "+JSON.stringify(this.validation));
		}

		return (
			<Row className="thingView row">
				<Col lg={10} md={9} sm={8} xs={6} className="properties">

					<NameInput value={this.props.thing.name} originalValue={originalName} isUpdated={nameUpdated} 
						handleChange={this.props.updateThing} validate={this.validate}  />

					<IsASelect value={this.props.thing.isa} status={isaStatus} thingName={this.props.thing.name}
						addThing={this.handleSave} handleChange={this.props.updateThing} validate={this.validate} />
					
					<CategoryTabs thing={this.props.thing} 
						handleChange={this.props.updateThing} getStatus={this.getStatus} validate={this.validate} setPreview={this.setPreview} />

					<SubmitButton name={this.props.thing.name} isValid={this.state.isValid} isUpdated={isUpdated}
						handleSave={this.handleSave} handleDelete={this.handleDelete} />

				</Col>
				<Col lg={2} md={3} sm={4} xs={6}>
					<Preview {...this.state.instance} />
					<Button bsStyle={this.props.thing.name && this.props.thing.name.length ? "default" : "danger"} onClick={this.handleDelete} className="delete-btn">
						<i className="fa fa-trash"></i> Delete
					</Button>
					<Button bsStyle={"default"} onClick={this.handleImport}>
						<i className="fa fa-save">2.0 Import</i> 
					</Button>
				</Col>
			</Row>
		)
	}
}

class Preview extends React.Component{
	render(){
		const t = this.props;

		const contains = (t.thing) ? t.thing.getContains() : [];

		const children = (contains) ? contains.map((child, i) => (<li key={i}>
			{(typeof child === "string") ? child : (child instanceof Array ) ? child.join(", ") : child.name }
		</li>)) : [];
		
		return (
		<div id="preview">
			<h5>PREVIEW</h5>
			<div className={ children && children.length ? "child link" : "child"}>
				<div className={"child-inner "+t.cssClass} style={{color:t.textColor}}>
					<i className={t.icon}></i>
					<h1>{t.name}</h1>
				</div>
			</div>
			<ul>
				{children}
			</ul>
		</div>);
	}
}


function SubmitButton(props){
	return(
	<ButtonToolbar className="submit-buttons">
		<Button bsStyle="success" bsSize="lg" className={props.isUpdated ? "" : "hidden"} disabled={!props.isValid}
			 onMouseDown={props.handleSave}>Save</Button>
	</ButtonToolbar>);
}
