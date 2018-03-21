import React, { Component } from "react";
import {TransitionGroup,  CSSTransition} from 'react-transition-group'
import PropTypes from "prop-types";
import WebFont from 'webfontloader';

import DB from "../../actions/CRUDAction";
import Ancestors from './Ancestors';
import Splash from '../Explore/Splash'

import './Explore.css';

const EMPTY_MESSAGE = <p>Contains nothing</p>; 

/**
 * This manages the tree data
 */
export default class TreeManager extends Component {
	static propTypes = {
		// should be auto-passed from router
		location: PropTypes.object.isRequired,
		match: PropTypes.object.isRequired
	}
	state = {
		current: null, // the current node being viewed
		lookup: {}, // a lookup of index pointers in case the user uses back/forward
		error: null,
		loadedFonts: []
	}
	constructor(props){
		super(props);

		this.handleRestart = this.handleRestart.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.setIndex = this.setIndex.bind(this);
	}
	// first ajax data pull
	componentDidMount(){
		var index = this.getIndexFromHash(this.props);
		var _this = this;

		if(!this.props.match.params.packurl) return;

		DB.get(this.props.location.pathname, index)
			.then(({ error, data: current })=>{

				if(error){
					_this.setState({ error: error.display });
				}

				else{
					var lookup = this.state.lookup;
					lookup[current.index] = current;
					_this.setCurrent({ current , lookup, error });
					if(current.index !== index) _this.setIndex(index);
				}
			});
	}

	// location has changed
	componentWillReceiveProps(nextProps){
		const isNewPack = (this.props.match.params.packurl !== nextProps.match.params.packurl) && (!!nextProps.match.params.packurl);
		const isNoPack = (this.props.match.params.packurl !== nextProps.match.params.packurl) && (!nextProps.match.params.packurl);
		const isNewNode = (this.props.location.hash !== nextProps.location.hash
					 && "#"+this.state.current.index !== nextProps.location.hash);

		// set current does the lookup
		if(isNewNode || isNewPack || isNoPack){
			var index = this.getIndexFromHash(nextProps);
			if(this.state.lookup[index]){
				this.setCurrent({ current: this.state.lookup[index], error: null }, nextProps)
			}
			else if(isNewPack && this.props.location.state !== nextProps.location.state){
				this.setCurrent({ current: nextProps.location.state.current, error: null }, nextProps);
			}
		}
	}

	shouldComponentUpdate(nextProps, nextState){
		this.makeUrlMatchCurrent(nextState, nextProps);

		return this.state.current !== nextState.current 
			|| this.state.error !== nextState.error
			|| this.props.match !== nextProps.match;
	}

	getIndexFromHash(props){
		return props.location.hash ? parseInt(props.location.hash.substr(1), 10) : "";
	}

	setCurrent(data, props){

		if(data){
			data.error = null;
			this.setState(data);
		}

		if(!props) props = this.props;

		var curr = data.current;
		if(curr === null) return;
		const _this = this;

		// load webfont
		if(curr.font && !this.state.loadedFonts.includes(curr.font)){
			WebFont.load({
				google: {
					families: [curr.font]
				}
			});
			var lf = [curr.font].concat(this.state.loadedFonts)
			this.setState({loadedFonts:lf});
		}

		// detect if need to start the ajax call
		var getChildren = (curr.in === true)
		if(getChildren){
			DB.get(props.location.pathname, curr.index)
				.then(({ error, data: current })=>{
					if(error){
						_this.setState({ error: error.display });
					}
					else{
						current.index = parseInt(current.index, 10);
						var lookup = _this.state.lookup;
						lookup[current.index] = current;
						var isCurrentlyVisible = _this.props.match.params.packurl && 
							(_this.state.current.index === current.index 
							|| typeof _this.state.current.index === 'undefined');

						if(isCurrentlyVisible){
							_this.setState({ current, lookup });
						}else{
							_this.setState({lookup});
						}
				}
			});
		}
	}

	// will set the history, and component will recieve the new props
	setIndex(index){
		if(isNaN(index)) return;

		if(index === 0){
			if(this.props.location.hash !== "")
				this.props.history.push(this.props.location.pathname);
		}
		else if(this.props.location.hash !== '#'+index){
			this.props.history.push('#'+index);
		}
	}

	handleRestart(){
		this.setCurrent({current: null, lookup: {}, error: null });
		this.setIndex(0);

		// reset universe
		DB.fetch('explore', "DELETE")
			.then(()=>{ return DB.fetch(this.props.location.pathname)})
			.then(({err , data})=>{
				this.setState({ current: data, lookup:{ [data.index] : data }})
				this.setIndex(data.index);
			});
	}

	handleClick(child){
		var lookup = this.state.lookup;

		if(child.in === true){
			if(lookup[child.index])
				child = lookup[child.index];
		}else{
			lookup[child.index] = child;
		}

		this.setCurrent({ current: child, lookup: lookup, error: null })
	}

	makeUrlMatchCurrent(nextState, nextProps){
		const nextHash = this.getIndexFromHash(nextProps);
		const isNewIndex = nextState.current	&& nextState.current.index !== nextHash;

		//ensure that the url matches the thing being rendered
		if(isNewIndex){
			this.setIndex(nextState.current.index);
		}
	}

	render(){

		if(this.state.error)	return <div className="main">{this.state.error}</div>;

		if(!this.props.match.params.packurl) 
			return <Splash />

		return (
			<CurrentNode current={this.state.current} 
						handleRestart={this.handleRestart} 
						handleClick={this.handleClick} 
						setIndex={this.setIndex} />
		)
	}
}

class CurrentNode extends Component {
	static get propTypes(){
		return {
			current: PropTypes.object,
			handleClick: PropTypes.func,
			handleRestart: PropTypes.func,
			setIndex: PropTypes.func
		}
	}
	render(){
		const inst = this.props.current;

		if(!inst) return <div id="content"><div id="title"></div>{LOADING}</div>;

		const cssClass = inst.cssClass+(!inst.in ? " empty":"");
		const fontStyle = (inst.font) ? {fontFamily:inst.font+', sans-serif'} : {};

		return (
			<div className={`main pt-5 container-fluid ${cssClass}`} style={{color:inst.txt}}>
				<h1 id="title">
					<Ancestors ancestors={inst.up ? inst.up : []}
						handleClick={this.props.handleClick}  />
					&nbsp;&nbsp;
					<i className={inst.icon}></i>
					&nbsp;
					<span className="webfont" style={fontStyle}>
						{inst.name ? inst.name : inst.isa}
					</span>
					<button className="btn btn-lg pull-right" onClick={this.props.handleRestart}>Restart</button>
				</h1>
				{ 
					inst.in === true ? LOADING : <Children arr={inst.in} handleClick={this.props.handleClick} parent={inst} />
				}
			</div>
		);
	}
}



class ChildInner extends Component {
	render(){
		const child = this.props.child;
		const className = "child-inner "+(child.in ? child.cssClass+" link" : " empty") + (child.icon ? "": " no-icon");
		var style = {color: child.txt};
		if(this.props.transparentBG) style.background = 'transparent';

		return (
			<div className={className} style={style}>
				<div className="wrap"><i className={child.icon}></i><h1>{child.name ? child.name : child.isa}</h1></div>
			</div>
		)
	}
}

class Children extends Component {
	constructor(props){
		super(props);
		this.onClick = this.onClick.bind(this);
	}
	onClick(c){
		this.props.handleClick(c);
	}
	render(){
		if(!this.props.arr || !this.props.arr.length) return EMPTY_MESSAGE;

		const className =  "child col-lg-2 col-md-3 col-sm-4 col-xs-6 "

		var list = this.props.arr.map((c,i) =>{
			var transitionStyle = {transitionDelay: 30*i + 'ms',animationDelay: 30*i + 'ms'};
			var transparentBG = c.cssClass === this.props.parent.cssClass;
			var innerChild = <ChildInner child={c} transparentBG={transparentBG} />
		

			var child;

			if(!c.in){
				child = <div key={c.index} style={transitionStyle} data-key={c.index} className={className+c.wrapperClass}>{innerChild}</div>
			}
			else{
				child = (
					<a style={transitionStyle} key={c.index} data-key={c.index} className={className+c.wrapperClass} onClick={()=>this.onClick(c)}>{innerChild}</a>
				)
			}

			return <CSSTransition key={c.index} classNames="slide-up" appear={true} timeout={{enter:(30*i)+500}} exit={false} style={transitionStyle}>{child}</CSSTransition>;
				
		});

		return <TransitionGroup className="row">{list}</TransitionGroup>;
	}
}


const LOADING_GIF = <i className="loading fa fa-spinner fa-spin"></i>;
const LOADING =  (
	<div className="child col-lg-2 col-md-3 col-sm-4 col-xs-6">
		<div className="child-inner loader fadeIn animated">
			{LOADING_GIF}
		</div>
	</div>);

/*
 <CSSTransitionGroup id="contains" 
				className={"row "+this.props.wrapperClass}
				transitionName="slide-up"
				transitionAppear={true}
				transitionAppearTimeout={50}
				transitionEnterTimeout={50}
				transitionLeave={false}>{list}</CSSTransitionGroup>*/