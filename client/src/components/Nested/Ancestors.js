import React from 'react';
import { SplitButton, MenuItem } from 'react-bootstrap'

import instanceStore from '../../stores/instanceStore.js'

class Ancestors extends React.Component {
	constructor(props){
		super(props);
		this.parentID = this.props.parent;
		this.page = this.props.page;
	}
	render(){
		if(this.parentID === null) 
			return <span></span>

		var parentInst = instanceStore.get(this.parentID);
		var title = <span><i className="fa fa-angle-left"></i> {parentInst.name}</span>;
		var ancestors = [];
		var parent;

		if(parentInst.parent !== null){
			var current = parentInst.parent;
			while(current !== null){
				var ancestor = instanceStore.get(current);
				ancestors.push(
					<MenuItem key={ancestors.length+1} eventKey={current}
						onSelect={(key) => this.page.setInstance(key,true) } href={"#"+current}> 
						{ancestor.name}
					</MenuItem>)
				current = ancestor.parent;
			}
			parent = <SplitButton 
				title={title} href={"#"+this.parentID}
				onClick={() => this.page.setInstance(this.parentID,true)}
				id="ancestorDropdown" 
				className={parentInst.cssClass}
				style={{color:parentInst.textColor}}>
					{ancestors}
				</SplitButton>;
		}else{
			parent = (<a  
				href={"#"+this.parentID} className={"btn btn-default "+parentInst.cssClass}
				onClick={() => this.page.setInstance(this.parentID,true)} 
				style={{color:parentInst.textColor}}>
				{title}
			</a>)
		}

		return (<span className={"parent "+parentInst.cssClass} style={{color:parentInst.textColor}}>
				{parent}
				</span>)
	}
}

export default Ancestors;