import React from 'react'; 
const DEBUG = false;

class ContainsList extends React.Component {
	constructor(props){
		super(props);
		this.handleAdd = this.handleAdd.bind(this);
		this.handleRemove = this.handleRemove.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleClear = this.handleClear.bind(this);
		this.handleClickThing = this.handleClickThing.bind(this);

		this._validate(props);
	}
	shouldComponentUpdate(nextProps){
		return nextProps.list.equals(this.props.list)
			|| !Object.values(nextProps.status).equals(Object.values(this.props.status));
	}
	//validate
	componentWillUpdate(nextProps){
		if(DEBUG) console.log("\t ContainsList.componentWillUpdate");
		if(!this._validate(nextProps))
			this.props.validate("contains","error");
	}
	_validate(props){
		this.validationState = [];
		this.helpText = [];
		if(!props.status.isUpdated) return true;
		const list = props.list || [];
		var isValid = true;

		list.forEach((contain, index) => {
			var state, txt = "";

			if(!contain){
				state = "error";
				isValid = false;
				txt = <span>value is required.</span>;
			}
			else if(props.status.isUpdated[index]){
				state = "success";
			}
				
			this.validationState.push(state);
			this.helpText.push(txt);
		});
		
		if(DEBUG) {
			console.log("\t\t validationState: "+(this.validationState).join(", "));
		}
		return isValid;
	}
	handleChange(e){
		var index = e.target.getAttribute("data-index");
		var list = this.props.list;

		list.splice(index,1, e.target.value);

		if(DEBUG) console.log("\t\t handleChange: "+list.join(", "))
		this.props.handleChange("contains", list);
	}
	handleAdd(){
		var list = this.props.list.concat([""]);
		this.props.handleChange("contains", list);
	}
	handleRemove(e){
		var index = e.currentTarget.getAttribute("data-index");
		var value = e.currentTarget.getAttribute("data-value");
		var list = this.props.list;

		list.splice(index,1);
		if(list.length === 0) list = undefined;

		if(DEBUG) console.log("\t\t handleRemove:  removed "+value+" -- "+list.join(", "))
		this.props.handleChange("contains", list);
	}
	handleClear(){
		this.props.handleChange("contains", undefined, true);
	}
	handleClickThing(e){
		var type = e.target.getAttribute("data-type");
		var thing = e.target.getAttribute("data-thing");
		if(DEBUG) console.log("ContainsList.handleClickThing: "+thing);

		if(!thing || type !== "thing") return;

		if(thing.charAt(0) === ".") {
			thing = thing.substring(1);
		}
		/*thing = new Contain(thing).value
		setTimeout(() =>{
			if(DEBUG) console.log("===== GOTO "+thing);
			window.location.hash = '#'+encodeURIComponent(thing);
		},10)*/
	}
	render(){
		if(DEBUG) console.log("\t----- ContainsList RENDER: "+this.props.list.join(", "));

		const list = this.props.list.map((item, index) => {
			try{
				item = JSON.parse(item);
			}catch(e){}

			var type = (item === "") ? "" 
				: (item.roll) ? "Table" 
				: (typeof item !== "string") ? "embedded thing"
				: (true) ? "thing" : "text"; //thingStore.exists(item)

			var value = (typeof item === "string") ? item : JSON.stringify(item);

			return (
			<div className="form-group" key={index} validationstate={this.validationState[index]}>
				<div className={`input-group ${value ? "":"no-input-addons"}`}>
					
					<input onChange={this.handleChange} value={value} type="text" data-index={index}
						className={ (this.props.status.isEditable ?"":"fake-disabled")}
						componentclass="textarea" rows={(value) ? Math.ceil(value.length/50) : 1} />
					<div className={`input-group-addon ${value ? ("type "+type ): ("type hidden "+type)}`} 
						data-thing={item} data-type={type} onClick={this.handleClickThing} >
						{type}
					</div>
				</div>
				<button className="btn delete-btn" data-index={index} data-value={value}  onClick={this.handleRemove}>
					<span><i className="fa fa-trash" /></span>
				</button>
				<small>{this.helpText[index]}</small>
			</div>
			)
		});


		return(
		<div id="containsList">
				{list}
				<br/>
				<div className="btn-group">
					<button onClick={this.handleAdd}><i className="fa fa-plus"></i> Add</button>
					<button className={"clear-button "+(this.props.status.isClearable ? "": "hidden")} onClick={this.handleClear}>
						<i className="glyphicon glyphicon-remove"></i> Clear all changes
					</button>
				</div>
		</div>)
	}
}

export default ContainsList;