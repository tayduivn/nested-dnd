import React, { Component } from "react";
import { CSSTransitionGroup } from 'react-transition-group'
import { Button,MenuItem,SplitButton } from 'react-bootstrap';
import PropTypes from "prop-types";

import DB, { HEADERS } from "../../actions/CRUDAction";

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
		DataManager.getCurrentNode(index, this.props.location.pathname, (current)=>{

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
		if(document.getElementById("title"))
			document.getElementById("title").className="animated fadeIn";
		this.setState(data);

		var curr = data.current;

		//detect if need to start the ajax call
		var getChildren = (curr.children === true)
		if(!getChildren && curr.children){
			for(var i = 0; i < curr.children.length; i++){
				if(curr.children[i] === true){
					getChildren = true;
					break;
				}
			}
		}

		if(getChildren){
			DataManager.getCurrentNode(curr.index, this.props.location.pathname, (current)=>{
				if(this.state.current.index ===  current.index){
					this.setState({ current });
				}else{
					var lookup = this.state.lookup;
					lookup[current.index] = current;
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

		// do this first, just for display
		var noChildren = this.state.current;
		delete noChildren.children;
		this.setCurrent({current: noChildren});

		// reset storage
		DataManager.getCurrentNode(0, this.props.location.pathname, (current)=>{
			this.setCurrent({current: current});
		});

	}

	handleClick(child){
		var lookup = this.state.lookup;

		if(child.children === true){
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

const DataManager = {
	getCurrentNode: function(index, url, callback){
		if(index === 0)
			this.makeSeed(url, callback);
		else
			this.makeNode(index, url, callback)
	},
	makeSeed(url, callback){
		fetch("/api"+url, HEADERS)
			.then((response)=>{
				if(response.status !== 200) {
					// TODO
				}
				return response.json();
			})
			.then((json)=>{
				if(callback) callback(json);
			})
	},
	makeNode(index, url, callback){
		fetch("/api"+url+"/"+index, HEADERS)
			.then((response)=>{
				if(response.status !== 200) {
					// TODO
				}
				return response.json();
			})
			.then((json)=>{
				if(callback) callback(json);
			})
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
		if(!inst) return <p>LOADING</p>;

		return (
			<div id="content" className={"container-fluid "+inst.cssClass} style={{color:inst.textColor}}>
				<h1 id="title">
					<Ancestors 
						ancestors={inst.ancestors}
						handleClick={this.props.handleClick}  /> 
					<i className={inst.icon}></i> {inst.name}
					<Button className="pull-right" bsStyle="default" onClick={this.props.handleRestart}>Restart</Button>
				</h1>
				{
					inst.children === true ? <p>LOADING</p> : <Children arr={inst.children} handleClick={this.props.handleClick} />
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

		const className =  "child col-lg-2 col-md-3 col-sm-4 col-xs-6"

		var list = this.props.arr.map((c,i) =>{
			var transitionStyle = {transitionDelay: 30*i + 'ms'};
			var innerChild = <ChildInner child={c} />

			if(!c.children)
				return <div key={c.index} data-key={c.index} className={className} style={transitionStyle}>{innerChild}</div>
			else
				return (
					<a key={c.index} data-key={c.index} className={className} style={transitionStyle} onClick={()=>this.onClick(c)}>{innerChild}</a>
				)
		});

		return (<CSSTransitionGroup id="contains" className="row"
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
		const className = "child-inner "+child.cssClass + (!child.isEmpty ? " link" : "");
		const style = {color: child.textColor};

		return (
			<div className={className} style={style}>
				<i className={child.icon}></i>
				<h1>{child.name}</h1>
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
		ancestor.children = true;
		this.props.handleClick(ancestor);
	}
	render(){
		const ancestors = this.props.ancestors;

		if(!ancestors || !ancestors.length) return null;

		var parentInst = ancestors[0];
		var title = <span><i className="fa fa-angle-left"></i> {parentInst.name}</span>;
		var renderParent;

		if(this.props.ancestors && this.props.ancestors.length > 1){

			var renderAncestors = this.props.ancestors.map((a,i)=>{
				if(i === 0) return null;

				return <MenuItem key={i} eventKey={i}
					onSelect={(key) => ( this.onClick(this.props.ancestors[key])) } href={"#"+a.index}> 
					{a.name}
				</MenuItem>
			});

			renderParent = <SplitButton 
				title={title}
				onClick={() => ( this.onClick(parentInst)) }
				id="ancestorDropdown" 
				className={parentInst.cssClass}
				style={{color:parentInst.textColor}}>
					{renderAncestors}
			</SplitButton>

		}else{
			renderParent = (<a onClick={() => ( this.onClick(parentInst)) }
				className={"btn btn-default "+parentInst.cssClass}
				style={{color:parentInst.textColor}}>
				{title}
			</a>)
		}

		return (<span className={"parent "+parentInst.cssClass} style={{color:parentInst.textColor}}>
				{renderParent}
		</span>)
	}
}