import React, { Component } from "react";
import PropTypes from "prop-types";

import './Ancestors.css'

export default class Ancestors extends Component {
	static propTypes = {
		ancestors: PropTypes.array, // index n ame
		handleClick: PropTypes.func.isRequired
	}
	constructor(props){
		super(props);
		this.onClick = this.onClick.bind(this);
	}
	onClick(ancestor){
		ancestor.in = true;
		this.props.handleClick(ancestor);
	}
	render(){
		const ancestors = this.props.ancestors;

		if(!ancestors || !ancestors.length) return null;

		var parentInst = ancestors[0];
		var title = <span>{parentInst.name}</span>;
		var renderParent = null;
		var style = {color:parentInst.txt};

		// split button
		if(ancestors.length > 1){

			// each in the list
			var renderAncestors = ancestors.map((a,i)=>{
				if(i === 0) return null;

				return <button className="dropdown-item" key={i}
					onClick={()=>this.onClick(a)}> 
					{a.name}
				</button>
			});

			// split button
			renderParent = (<div className={`parent mb-2 btn-group ${parentInst.cssClass}`}>
					<div className={`btn-group dropleft ${parentInst.cssClass}`} role="group" id="ancestorDropdown">
						<SplitButtonToggle style={style} />
						<div className="dropdown-menu dropdown-menu-right" style={style}>
							{renderAncestors}
						</div>
					</div>
					<button type="button" className={`btn btn-lg`} onClick={()=>(this.onClick(parentInst))} style={style}>{title}</button>
				</div>)

		}

		// only one parent
		else{
			renderParent = (<button onClick={() => ( this.onClick(parentInst)) }
							className={"parent mb-2 btn btn-lg "+parentInst.cssClass}
							style={style}>
							<i className="fa fa-caret-left mr-2" /> {title}
						</button>)
		}

		return renderParent;
	}
}


const SplitButtonToggle = ({ style, cssclass }) => (
	<button type="button" className={`btn btn-lg dropdown-toggle dropdown-toggle-split ${cssclass}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={style}>
    <span className="sr-only">Toggle Dropleft</span>
  </button>
)