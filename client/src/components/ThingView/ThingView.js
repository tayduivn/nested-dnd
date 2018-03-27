import React from 'react';

import NameInput from './NameInput'
import IsASelect from './IsASelect'
import CategoryTabs from './CategoryTabs'


const ThingViewDisplay = ({thing, nameUpdated, updateThing, validate, isaStatus, handleSave, getStatus, setPreview, isValid, isUpdated, handleDelete, instance}) => (
	<div className="thingView row">
		<div className="col-lg-10 col-xs col-sm-8 col-md-9 properties">

			<NameInput value={thing.name} originalValue={thing.originalOptions.name} isUpdated={nameUpdated} 
				handleChange={updateThing} validate={validate}  />

			<IsASelect value={thing.isa} status={isaStatus} thingName={thing.name}
				addThing={handleSave} handleChange={updateThing} validate={validate} />
			
			<CategoryTabs thing={thing} 
				handleChange={updateThing} getStatus={getStatus} validate={validate} setPreview={setPreview} />

			<SubmitButton name={thing.name} isValid={isValid} isUpdated={isUpdated}
				handleSave={handleSave} handleDelete={handleDelete} />

		</div>
		<div className="col-xs col-sm-4 col-md-3 col-lg-2">
			<Preview {...instance} />

			<button onClick={handleDelete}
				className={`delete-btn ${thing.name && thing.name.length ? "default" : "danger"}`} >
				<i className="fa fa-trash"></i> Delete
			</button>
		</div>
	</div>
)

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
		// this.handleImport = this.handleImport.bind(this);
	}

	shouldComponentUpdate(nextProps, nextState){
		var changed = this.props.thingID !== nextProps.thingID
			|| !Object.values(this.state).equals(Object.values(nextState))
			|| !Object.values(this.props.thing).equals(Object.values(nextProps.thing));
		return changed;
	}

	componentWillReceiveProps(nextProps){
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
		if(!this.state.isValid){
			this._revertToValid();
		}
		if(this.state.instance){
			//instanceStore.delete(this.state.instance);
		}
	}

	_createPreview(thingID){
		if(this.state && this.state.instance){
			//instanceStore.delete(this.state.instance);
		}
		
		if(!thingID) return null;

		var instance;
		try{
			//instance = instanceStore.add(thingID);	
			try{
				//instance.name = tableStore.roll(JSON.parse(instance.thing.namegen));
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
				delete this.validation[property];
				this.props.updateThing(property, undefined, true);
			}
		}
	}

	_setStateIsValid(){
		var isValid = Object.keys(this.validation).length && Object.values(this.validation).filter(val=>!val).length === 0

		if(isValid !== this.state.isValid){
			this.setState({ 
				isValid: isValid
			});
		}
	}


	validate(property, validationState){

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
		this.props.saveThing(this.props.thingID, true);
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
		
		return <ThingViewDisplay {...this} {...this.props} {...this.state} 
			isisUpdated={Object.keys(this.validation).length > 0}
			isaStatus={this.getStatus("isa")}
			nameUpdated={this.getStatus("name").isUpdated}
		/>
	}
}

const PrevChild = ({child, index}) => (
	<li key={index}>
		{(typeof child === "string") ? child : (child instanceof Array ) ? child.join(", ") : child.name }
	</li>
)

const PreviewDisplay = ({children, cssClass, textColor, icon, name}) => (
	<div id="preview">
		<h5>PREVIEW</h5>
		<div className={ children && children.length ? "child link" : "child"}>
			<div className={"child-inner "+cssClass} style={{color:textColor}}>
				<i className={icon}></i>
				<h1>{name}</h1>
			</div>
		</div>
		<ul>
			{children}
		</ul>
	</div>
)

class Preview extends React.Component{
	render(){
		const contains = (this.props.thing) ? this.props.thing.getContains() : [];
		const children = (contains) ? contains.map((c, i) =><PrevChild child={c} index={i} />) : [];

		return <PreviewDisplay {...this.props} children={children} />;
	}
}


function SubmitButton(props){
	return(
	<div className="btn-group submit-buttons">
		<button bsStyle="success" bssize="lg" className={props.isUpdated ? "" : "hidden"} disabled={!props.isValid}
			 onMouseDown={props.handleSave}>Save</button>
	</div>);
}
