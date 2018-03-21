import React from "react";
import Ancestors from './Ancestors';
import {TransitionGroup,  CSSTransition} from 'react-transition-group'

const EMPTY_MESSAGE = <p>Contains nothing</p>; 
const CHILD_CLASSES = "child col-lg-2 col-md-3 col-sm-4 col-xs-6 ";
const TRANSITION_OPTIONS = {
	classNames: "slide-up",
	appear: true,
	exit: true
};
const LOADING_GIF = <i className="loading fa fa-spinner fa-spin"></i>;
const LOADING = (
	<div className="child col-lg-2 col-md-3 col-sm-4 col-xs-6">
		<div className="child-inner loader fadeIn animated">
			{LOADING_GIF}
		</div>
	</div>);

const ExplorePage = ({ name, isa, cssClass, in: inArr, txt, up, icon, font, handleClick, handleRestart }) => (
	<div className={`main pt-5 container-fluid ${cssClass}`} style={{color:txt}}>
		<h1 id="title">
			<Ancestors ancestors={up ? up : []}
				handleClick={handleClick}  />{"  "}
			<i className={icon}></i>{" "}
			<span className="webfont" style={(font) ? {fontFamily:font+', sans-serif'} : {}}>
				{name ? name : isa}
			</span>
			<button className="btn btn-lg pull-right" onClick={handleRestart}>Restart</button>
		</h1>
		{ 
			inArr === true ? LOADING : 
			!inArr || !inArr.length ? EMPTY_MESSAGE :
			<Children arr={inArr} handleClick={handleClick} parentCSS={cssClass} />
		}
	</div>
)

const Children = ({ arr, handleClick, parentCSS }) => (
	<TransitionGroup className="row">
		{arr.map((c,i) => (
			<CSSTransition key={c.index} timeout={{enter:(30*i)+500, exit: 1}} {...TRANSITION_OPTIONS}>
				<Child i={i} child={c} transparentBG={c.cssClass === parentCSS} handleClick={handleClick} />
			</CSSTransition>
		))}
	</TransitionGroup>
);

const Child = ({ child, handleClick, transparentBG, i }) => (
	<div className={CHILD_CLASSES} style={{transitionDelay: 30*i + 'ms'}} 
			onClick={()=>{if(child.in) handleClick(child)} }>
		<ChildInner {...child} transparentBG={transparentBG} />
	</div>
)

const ChildInner = ({ name, isa, in: inArr, transparentBG, cssClass, icon, txt}) => {
	const className = `child-inner ${inArr ? cssClass+" link" : " empty"} ${icon ? "": " no-icon"}`;
	var style = { color: txt };
	if(transparentBG) style.background = 'transparent';

	return (
		<div className={className} style={style}>
			<div className="wrap"><i className={icon}></i><h1>{name ? name : isa}</h1></div>
		</div>
	);
}

export default ExplorePage;
export { LOADING };