import React, { Component } from "react";
import { CSSTransitionGroup } from 'react-transition-group'
import { Button,MenuItem,SplitButton } from 'react-bootstrap';
import PropTypes from "prop-types";

import DB from "../../actions/CRUDAction";

const EMPTY_MESSAGE = <p>Contains nothing</p>; 

/**
 * This manages the tree data
 */
export default class TreeManager extends Component {
	static get propTypes(){
		return {
			// should be auto-passed from router
			location: PropTypes.object.isRequired
		}
	}
	constructor(props){
		super(props);
		this.state = {
			current: null, // the current node being viewed
			lookup: {} // a lookup of index pointers in case the user uses back/forward
		}

		this.handleRestart = this.handleRestart.bind(this);
		this.handleClick = this.handleClick.bind(this);
		this.setIndex = this.setIndex.bind(this);
	}
	// first ajax data pull
	componentDidMount(){
		var index = this.getIndexFromHash(this.props);

		DB.get(this.props.location.pathname, index)
			.then(({ error, data: current })=>{
				var lookup = this.state.lookup;
				lookup[current.index] = current;
				this.setCurrent({ current , lookup });
				if(current.index !== index) this.setIndex(index);
			});
	}

	// location has changed
	componentWillReceiveProps(nextProps){
		if(this.props.location.hash !== nextProps.location.hash
			 && "#"+this.state.current.index !== nextProps.location.hash){
			var index = this.getIndexFromHash(nextProps);
			if(this.state.lookup[index]){
				this.setCurrent({ current: this.state.lookup[index]})
			}
		}
	}

	shouldComponentUpdate(nextProps, nextState){
		this.makeUrlMatchCurrent(nextState, nextProps);

		return this.state.current !== nextState.current;
	}

	getIndexFromHash(props){
		return props.location.hash ? parseInt(props.location.hash.substr(1), 10) : 0;
	}

	setCurrent(data){

		this.setState(data);

		var curr = data.current;
		if(curr === null) return;

		//detect if need to start the ajax call
		var getChildren = (curr.in === true)
		/*if(!getChildren && curr.in){
			for(var i = 0; i < curr.in.length; i++){
				if(curr.in[i] === true){
					getChildren = true;
					break;
				}
			}
		}*/

		if(getChildren){
			DB.get(this.props.location.pathname, curr.index)
				.then(({ error, data: current })=>{

					var lookup = this.state.lookup;
					lookup[current.index] = current;

					if(this.state.current.index === current.index){
						this.setState({ current, lookup });
					}else{
						this.setState({lookup});
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
		this.setCurrent({current: {
			in: true,
			cssClass: this.state.current.cssClass //keep the same background color
		}, lookup: {}});
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

		this.setCurrent({ current: child,lookup: lookup })
	}

	makeUrlMatchCurrent(nextState, nextProps){
		var nextHash = this.getIndexFromHash(nextProps);

		//ensure that the url matches the thing being rendered
		if(nextState.current	&& nextState.current.index !== nextHash
			){
			this.setIndex(nextState.current.index);
		}
	}

	render(){
		return <CurrentNode current={this.state.current} handleRestart={this.handleRestart} 
			handleClick={this.handleClick} setIndex={this.setIndex} />
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

		return (
			<div id="content" className={"container-fluid "+cssClass} style={{color:inst.txt}}>
				<h1 id="title">
					<Ancestors ancestors={inst.up ? inst.up : []}
						handleClick={this.props.handleClick}  />
					&nbsp;&nbsp;
					<i className={inst.icon}></i> {inst.name ? inst.name : inst.isa}
					<Button className={"pull-right "+cssClass} bsStyle="default" onClick={this.props.handleRestart}>Restart</Button>
				</h1>
				{ 
					inst.in === true ? LOADING : <Children arr={inst.in} handleClick={this.props.handleClick} parent={inst} />
				}
			</div>
		);
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
			var transitionStyle = {transitionDelay: 30*i + 'ms'};
			var transparentBG = c.cssClass === this.props.parent.cssClass;
			var innerChild = <ChildInner child={c} transparentBG={transparentBG} />


			if(!c.in)
				return <div key={c.index+i} data-key={c.index} className={className+c.wrapperClass} style={transitionStyle}>{innerChild}</div>
			else
				return (
					<a key={c.index+i} data-key={c.index} className={className+c.wrapperClass} style={transitionStyle} onClick={()=>this.onClick(c)}>{innerChild}</a>
				)
		});

		return (<CSSTransitionGroup id="contains" 
				className={"row "+this.props.wrapperClass}
				transitionName="slide-up"
				transitionAppear={true}
				transitionAppearTimeout={50}
				transitionEnterTimeout={50}
				transitionLeave={false}>{list}</CSSTransitionGroup>);
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

class Ancestors extends React.Component {
	static get propTypes(){
		return {
			ancestors: PropTypes.array, // index n ame
			handleClick: PropTypes.func.isRequired
		}
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
		var title = <span><i className="fa fa-angle-left"></i> {parentInst.name}</span>;
		var renderParent;
		var style = {color:parentInst.txt};

		if(ancestors.length > 1){

			var renderAncestors = ancestors.map((a,i)=>{
				if(i === 0) return null;

				return <MenuItem key={i} eventKey={i}
					onSelect={(key) => ( this.onClick(ancestors[key])) } href={"#"+a.index}> 
					{a.name}
				</MenuItem>
			});

			renderParent = <SplitButton 
				title={title} href=""
				onClick={() => ( this.onClick(parentInst)) }
				id="ancestorDropdown" 
				className={parentInst.cssClass}
				style={style}>
					{renderAncestors}
			</SplitButton>

		}else{
			renderParent = (<a onClick={() => ( this.onClick(parentInst)) }
				className={"btn btn-default "+parentInst.cssClass}
				style={style}>
				{title}
			</a>)
		}

		return (<span className={"parent "+parentInst.cssClass} style={style}>
				{renderParent}
		</span>)
	}
}

const LOADING_GIF = <i className="loading fa fa-spinner fa-spin"></i>;
const LOADING =  (
	<div className="child col-lg-2 col-md-3 col-sm-4 col-xs-6">
		<div className="child-inner loader fadeIn animated">
			{LOADING_GIF}
		</div>
	</div>);
