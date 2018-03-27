import React, { Component } from "react";
import PropTypes from "prop-types";

import './Ancestors.css'

//const A = ({ancestors, handleClick}) => ();


const SplitButton = ({parentInst, style, ancestors, onClick, cssclass}) => (
	<div className={`parent mb-2 btn-group ${cssclass}`}>
		<div className={`btn-group dropleft ${cssclass}`} role="group" id="ancestorDropdown">
			<SplitButtonToggle style={style} cssclass={cssclass} />
			<div className="dropdown-menu dropdown-menu-right" style={style}>
				{ancestors.map((a,i)=>{
					if(i === 0) return null;

					return <button className="dropdown-item" key={i} 
						onClick={()=>this.onClick(a)}> 
						{a.name}
					</button>
				})}
			</div>
		</div>
		<button type="button" className={`btn btn-lg ${cssclass}`} onClick={()=>(onClick(parentInst))} style={style}>
			<span>{parentInst.name}</span>
		</button>
	</div>
);

const OneButton = ({onClick, parentInst, style}) =>  (
	<button onClick={() => ( onClick(parentInst)) }
		className={"parent mb-2 btn btn-lg "+parentInst.cssClass}
		style={{color:parentInst.txt}}>
		<i className="fa fa-caret-left mr-2" /> <span>{parentInst.name}</span>
	</button>
)

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
		const a = this.props.ancestors;
		var cssClass;
		return (!a || !a.length) ? null 
				: (a.length > 1) ? <SplitButton parentInst={a[0]} cssclass={cssClass = this.props.pageClass === a[0].cssClass ? '' : a[0].cssClass} style={{color:a[0].txt}} ancestors={a} onClick={this.onClick}  /> 
				: <OneButton parentInst={a[0]} onClick={this.onClick} cssclass={cssClass} />;
	}
}


const SplitButtonToggle = ({ style, cssclass }) => (
	<button type="button" className={`btn btn-lg dropdown-toggle dropdown-toggle-split ${cssclass}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={style}>
    <span className="sr-only">Toggle Dropleft</span>
  </button>
)