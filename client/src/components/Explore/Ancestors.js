import React, { Component } from "react";
import PropTypes from "prop-types";

import { getColor } from './ExplorePage'

import './Ancestors.css'

const SplitButton = ({parentInst, style, ancestors, onClick, cssclass, border}) => (
	<div className={`parent col btn-group`}>
		<div className={`btn-group dropleft`} role="group" id="ancestorDropdown">
			<SplitButtonToggle style={style} cssclass={cssclass} />
			<div className={"dropdown-menu dropdown-menu-right "+cssclass}>
				{ancestors.map((a,i)=>{
					if(i === 0 || !a) return null;

					return <button className={"btn dropdown-item "+cssclass} key={i} 
						onClick={()=>onClick(a)}> 
						{a.name}
					</button>
				})}
			</div>
		</div>
		<button type="button" className={`btn immediate ${cssclass}`} onClick={()=>(onClick(parentInst))} style={style}>
			<span>{parentInst.name}</span>
		</button>
	</div>
);

const OneButton = ({onClick, parentInst}) =>  (
	<button onClick={() => ( onClick(parentInst)) }
		className={"col parent btn "+parentInst.cssClass}
		style={{color:parentInst.txt}}>
		<i className="fa fa-caret-left mr-2" /> <span>{parentInst.name}</span>
	</button>
)

const SplitButtonToggle = ({ style, cssclass }) => (
	<button type="button" className={`btn dropdown-toggle dropdown-toggle-split ${cssclass}`} data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style={style}>
    <span className="sr-only">Toggle Dropleft</span>
  </button>
)

export default class Ancestors extends Component {
	static propTypes = {
		ancestors: PropTypes.array, // index n ame
		handleClick: PropTypes.func.isRequired
	}
	static defaultProps = {
		ancestors: [{}]
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
		const parent = a[0] || {};
		var cssClass = parent.cssClass + ((parent.cssClass === this.props.pageClass) ? ' transparent' : '');
		

		return (!a || !a.length) ? <div className="col"></div>
				: (a.length > 1) ? <SplitButton parentInst={parent} cssclass={cssClass} style={{color: parent.txt, borderColor: getColor(this.props.pageClass)}} ancestors={a} onClick={this.onClick}  /> 
				: <OneButton parentInst={parent} onClick={this.onClick} cssclass={cssClass} />;
	}
}