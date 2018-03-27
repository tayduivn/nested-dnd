import React, { Component } from "react";
import PropTypes from "prop-types";

import './Ancestors.css'

//const A = ({ancestors, handleClick}) => ();


const SplitButton = ({parentInst, style, ancestors}) => (
	<div className={`parent mb-2 btn-group ${parentInst.cssClass}`}>
		<div className={`btn-group dropleft ${parentInst.cssClass}`} role="group" id="ancestorDropdown">
			<SplitButtonToggle style={style} />
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
		<button type="button" className={`btn btn-lg`} onClick={()=>(this.onClick(parentInst))} style={style}>
			<span>{parentInst.name}</span>
		</button>
	</div>
);

const OneButton = ({onClick, parentInst, style}) =>  (
	<button onClick={() => ( this.onClick(parentInst)) }
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
		return (!a || !a.length) ? null 
				: (a.length > 1) ? <SplitButton parentInst={a[0]} style={{color:parentInst.txt}} ancestors={a} /> 
				: <OneButton parentInst={a[0]} onClick={this.onClick} />;
	}
}


const SplitButtonToggle = ({ style, cssclass }) => (
	<button type="button" className={`btn btn-lg dropdown-toggle dropdown-toggle-split ${cssclass}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={style}>
    <span className="sr-only">Toggle Dropleft</span>
  </button>
)