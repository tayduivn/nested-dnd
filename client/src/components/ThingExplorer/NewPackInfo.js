import React from 'react';
import Select from 'react-select';

const DEBUG = false;

class PackSelect extends React.Component {
	constructor(props) {
		 super(props);
		 this.state = {
			selectedPack: (localStorage.exportToPack) ? localStorage.exportToPack : "new"
		 };
		 this.export = this.export.bind(this);
		 this.updateState = this.updateState.bind(this);
		 this.loadOptions = this.loadOptions.bind(this);
	}
	loadOptions(input, callback){
		/*PackLoader.load(() => {
			var result = PackLoader.getPackOptions();
			if(DEBUG) console.log("PackSelect.loadOptions -- packs loaded");

			//check for selected pack
			var findSelected = result.options.find((o) => o.value === this.state.selectedPack);
			if(!findSelected){
				this.setState({
					selectedPack: "new"
				})
			}

			callback(null,result);
		});*/
	}
	updateState(element) {
		localStorage.exportToPack = element.value;
		this.setState({selectedPack: element});
	}
	clear(){
		// var doDelete = window.confirm("Are you sure you want to delete your changes?");
		/*if(doDelete){
			PackLoader.setNewPack(null);
			window.location.reload();
		}*/
	}
	export(){
		var packName = (this.state.selectedPack.value) ? this.state.selectedPack.value : this.state.selectedPack;
		this.props.export( (packName === "new" ) ? null : packName );
	}
	render(){
		/*const popoverBottom = (
			<button className="btn" data-toggle="popover" id="copiedToClipboard">Click to copy to clipboard</button>
		)*/
		return(
				<div class="form-group">
					<label>export pack:</label>
					{' '}
					<Select.Async clearable={false}
						loadOptions={this.loadOptions}
						name="form-field-name"
						value={this.state.selectedPack}
						onChange={this.updateState}
					/>
					<button className="btn btn-success" onClick={this.export}>export</button>
					<button className="btn btn-danger" onClick={this.clear}>clear</button>
				</div>
	 );
	}
} // <OverlayTrigger trigger={["hover","focus"]} placement="bottom" overlay={popoverBottom}>

export default class NewPackInfo extends React.Component{
	shouldComponentUpdate(nextProps){
		var updated = !Object.values(this.props).equals(Object.values(nextProps));
		if(DEBUG) console.log("NewPackInfo.shouldComponentUpdate: "+updated);
		return updated;
	}
	render(){
		const numThings = Object.keys(this.props.newPack.things).length;
		const numTables = Object.keys(this.props.newPack.tables).length;
		const hasData = numTables || numThings;

		if(DEBUG) console.log("NewPackInfo.RENDER: "+hasData);

		const message = (!hasData) ? <span>To change packs, click <i className="fa fa-gear"/> Settings.</span> : (
			<span>
				your new pack has <strong>{numThings}</strong> things and <strong>{numTables}</strong> tables 
			</span>
		)

		return (
		<div className={"row status-bar alert "+(hasData ? "alert-success" : "alert-info")}>
			<div className={"col-sm-5" +(hasData ? "animated pulse": "col-lg-12 col-md-12 col-sm-12 col-xs-12")}>
				{message}
			</div>
			<div sm={7} xs={12} className={hasData ? "" : "hidden"}>
				<form inline className="pull-right">
					<PackSelect export={this.props.export} /> 
				</form>
			</div>
			<a id="downloadAnchorElem"> </a>
		</div>);
	}
}