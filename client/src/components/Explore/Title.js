import React from "react";
import { Link } from "react-router-dom";

import Ancestors from './Ancestors';
import { ColorPicker, HexColorPicker } from '../Form/ColorPicker';
import { Icon, Isa } from './ExplorePage'

const CENTER_ALIGN = "d-flex align-items-center justify-content-center";
const VERTICAL_ALIGN = "d-flex align-items-center";

function componentToHex(c) {
		var hex = c.toString(16);
		return hex.length === 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
		return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function getTextColor(){
	
	var arr = window.$('body').css('color');
	if(!arr) return;

	arr = arr.replace('rgb(','').replace(')','').split(", ").map(n=>parseInt(n,10))

	return rgbToHex(arr[0],arr[1],arr[2]);
}

class SearchBar extends React.Component {
	state = {
		query: ''
	}
	handleChange = (e) =>{
		var query = e.target.value;
		this.setState({query});
	}
	render(){
		return (<div>
			<input value={this.state.query} className="form-control input-transparent" onChange={this.handleChange} />
			<ul>{this.state.query ?
				this.props.favorites.filter(
					f=>(
						f.name && f.name.toLowerCase && this.state.query && this.state.query.toLowerCase && 
						f.name.toLowerCase().includes(this.state.query.toLowerCase())&&f.index!==this.props.index
					))
				.map(f=>(
					<a key={f.index} href={"#"+f.index}><li>{f.name}</li></a>
				))
			: null}</ul>
		</div>);
	}
}

class Description extends React.Component {
	state = {
		focusNew: false
	}
	constructor(){
		super();
		this.newLine = React.createRef();
	}
	componentDidUpdate(){
		if(this.state.focusNew){
			if(this.newLine && this.newLine.current) {
				if(this.state.focusNew !== true){
					var child = this.newLine.current.parentElement.children[this.state.focusNew]
					if(child) child.focus();
				}
				else
					this.newLine.current.focus();
			}
			this.setState({focusNew: false})
		}
	}
	handleKeyDown = (e) => {
		var desc = this.props.desc || [];
		var i = Array.prototype.indexOf.call(e.target.parentElement.children, e.target) || 0;

		if(e.keyCode === 13 || e.keyCode === 9){
			var next = e.target.nextElementSibling;
			if(next){
				if(e.shiftKey){
					desc.splice(i+1, 0, "");
					this.setState({focusNew: i+1});
					e.target.blur();
					this.props.handleChange(this.props.index, 'desc', desc)
				}
				else
					next.focus();
			}
			else {
				if(!desc.length){
					desc = desc.concat(e.target.innerText.split(/\r\n|\n|\r/g).filter(s=>s.trim().length));
				}
				desc.push("");
				this.setState({focusNew: true})
				e.target.blur();
				this.props.handleChange(this.props.index, 'desc', desc)
			}
			e.preventDefault();
			return false;
		}
	}

	handleKeyUp = (e) => {
		var desc = this.props.desc || [];
		var i = Array.prototype.indexOf.call(e.target.parentElement.children, e.target) || 0;
		var text = e.target.innerText.trim();

		if(e.keyCode === 38 && e.target.previousElementSibling){ // up
			e.target.previousElementSibling.focus()
			return;
		}
		else if(e.keyCode === 40 && e.target.nextElementSibling){ // down 
			var next = e.target.nextElementSibling;
			if(next.dataset.new === 'true'){
				next.click();
			}
			next.focus()
			return;
		}
		else if(e.keyCode === 8 && !text.length){ //backspace on an empty element
			desc.splice(i,1);
			e.target.dataset["deleting"] = true;
			var prev = e.target.previousElementSibling;
			// e.target.remove();
			this.props.handleChange(this.props.index, 'desc', desc);
			if(prev) prev.focus();
			e.preventDefault();
			return false;
		}
	}
	handleBlur = (e) => {
		var desc = [];
		var lines = e.target.parentElement.children;

		if(e.target.dataset["deleting"]) {
			delete e.target.dataset["deleting"];
			return;
		}

		for(var i = 0, c; i < lines.length; i++){
			c = lines[i]
			var text = c.innerText;
			text = (text.length) ? text.split(/\r\n|\n|\r/g).filter(s=>s.trim().length) : [''];
			desc.push(...text);
			delete c.dataset["deleting"];
		};
		
		this.props.handleChange(this.props.index, 'desc', desc);
	}
	handlePaste = (e)=> {
		e.preventDefault();

    // get text representation of clipboard
    var text = e.clipboardData.getData("text/plain");

    // insert text manually
    document.execCommand("insertHTML", false, text);
	}

	render() {
		const { desc, highlight, isUniverse } = this.props;

		return (
			<ul id="description" className={highlight+" max-contrast "+(!desc.length ? "empty" : "")} onKeyDown={this.handleKeyDown} onKeyUp={this.handleKeyUp} onBlur={this.handleBlur}>
			{desc.map((d,i)=><li onPaste={this.handlePaste} key={i} contentEditable={isUniverse} ref={i === desc.length-1 ? this.newLine : undefined} dangerouslySetInnerHTML={{__html: d}}></li>)}
			{isUniverse && !desc.length ? <li key={desc.length+1} onPaste={this.handlePaste} type="text" ref={this.newLine} contentEditable={true} data-new="true"></li> 
				: null  
			}
		</ul>
		)
	}
}

class BGSelectPopover extends React.Component {
	
	constructor(props){
		super(props);
		this.ref = React.createRef()
		this.handleClick = this.handleClick.bind(this);

		this.state = {
			display: false
		}
	}

	handleClose = () =>{
		this.setState({display:false});
		window.$(this.ref.current).find('.sample').removeClass('selected');
	}

	currentSelected = () => {
		return this.props.cssClass.split(" ").find(c=>c.startsWith('bg-'))
	}
	handleClick(e){
		var doToggle = e.target.dataset.toggle === 'popover';
		var doReset = e.target.id === 'clearColor';
		var selected = (doReset) ? this.props.resetColor : e.target.dataset.class;
		var pattern = this.props.cssClass.split(" ").filter(c=>!c.startsWith('bg-')).join(" ");

		// hide
		if(doToggle){
			this.setState({display:false});
			return;
		}
		// reset
		else if(doReset){
			this.setState({display:false});
		}
		// show
		else if(!selected){
			this.setState({display:true});
			window.$(this.ref.current).find('.'+this.state.selected).addClass('selected');
			return;
		}
		// select the right color
		window.$(this.ref.current).find('.sample.selected').removeClass('selected');
		if(!doReset) e.target.className += " selected";

		// DB change
		var saveValue = (doReset) ? null : (selected+" "+pattern).trim();
		this.props.handleChange(this.props.index, 'cssClass', saveValue);
	}
	render(){
		return (
			<a id="bgOptions" tabIndex="0" ref={this.ref}>
				<button className={"btn bg "+this.props.cssClass} type="button"  data-toggle="popover" onClick={this.handleClick}>
					<div className={`bg swatch`}></div>	
				</button>
				<div id="bgOptionsPopover" className={"popover animated fadeIn "+(this.state.display ? '' : 'd-none')} role="tooltip" onClick={this.handleClick}>
					<div className="arrow"></div>
					<div className="popover-body">
						{this.currentSelected() ? <button id="clearColor" className="btn btn-default" data-class=""><i className="fa fa-times"/> use parent style</button> : null}
						<ColorPicker className="d-none" />
					</div>
				</div>
				{this.state.display ? <div className="popover-cover" onClick={ this.handleClose }/> : null}
			</a>
		)
	}
}


const StyleOptions = ({index, highlight, cssClass = "", txt, isa, name, location, parentBG, parentTxt, isFavorite,  handleChange, handleRestart, toggleData = ()=>{} }) => (
	<div id="styleOptions" className="col-xs-auto right">

		{/* Background */}
		<BGSelectPopover index={index} highlight={highlight} handleChange={handleChange} cssClass={cssClass} resetColor={parentBG} resetTxt={parentTxt} />
		
		{/* Pattern */}
		<button className={"btn "+cssClass} data-toggle="modal" data-target="#patternSelectModal">
			<div className={`pattern swatch`}>
				{ (cssClass.split(" ").length > 1) ? <i className="fa fa-check" /> : null }
			</div>
		</button>
		
		{/* Color */}
		<HexColorPicker index={index} color={getTextColor()} getTextColor={getTextColor} txt={txt} highlight={highlight} handleChange={handleChange} cssClass={cssClass} resetTxt={parentTxt} /> 

		<button className={"btn "+cssClass} onClick={()=>handleChange(index, 'isFavorite', !isFavorite)}>
			<i className={(isFavorite?"fas":"far")+" fa-star"} />
		</button>
		
		{/* Settings COG */}
		<div className="dropdown">
			<button className={"btn "+cssClass} type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
				<i className="fa fa-cog" />
			</button>

			<div className={"dropdown-menu dropdown-menu-right "+cssClass} aria-labelledby="dropdownMenuButton">
				{/* data */}
				<button className={"btn dropdown-item "+cssClass} onClick={toggleData}>edit data</button>

				{/* edit/create generator */}
				<Link to={(isa) ? `${location}/${isa}/edit` : `${location}/create?isa=${name}`}><button className={"btn dropdown-item "+cssClass}>{ isa ? <span>edit {isa} generator</span> : <span>create {name} generator</span> }</button></Link>

				{/* move */}
				<button className={"btn dropdown-item "+cssClass} data-toggle="modal" data-target="#moveModal">
					move
				</button>
			</div>
		</div>

		{/* Delete */}
		<button className={"btn "+cssClass} onClick={handleRestart}>
			<i className="far fa-trash-alt" />
		</button>
		
	</div>
)


const Title = ({up, cssClass, highlight, desc = [], isUniverse, favorites, icon, font, name, isa, txt, handleClick, handleChange, handleRestart, index, packid, savedCssClass, savedTxt, ...rest }) => (
	<div id="title" className="col-lg">
		<div className="name mt-3 mb-2 row animated fadeIn no-gutters">
			<div className={"icon-wrap col-auto col-lg-12 px-0 mb-lg-1 "+(isUniverse ? "universe ":" ")+CENTER_ALIGN}>
				{isUniverse ? (
					<button className={"btn btn-outline "+cssClass+" "+(!icon ? 'addNew':'')} 
						data-toggle="modal" data-target="#iconSelectModal" style={{color: txt}}>
						<Icon name={icon || 'far fa-plus-square'} alignment={CENTER_ALIGN} />
					</button>)
					: <Icon name={icon} alignment={CENTER_ALIGN} />
				}
			</div>
			<div className={"col col-lg-12 px-2 justify-content-lg-center "+VERTICAL_ALIGN}>
				<div id="name" style={{color: txt}}>
					<h1 className="webfont" dangerouslySetInnerHTML={{__html: name ? name : isa}}
						contentEditable={isUniverse} style={(font) ? {fontFamily: `'${font}', sans-serif`} : {}}
						onInput={(e)=>handleChange(index, 'name', e.target.innerText)}>
					</h1>
					<Isa {...{name, isa}} />
				</div>
			</div>
		</div>
		<nav className={`buttons-bar row no-gutters`}>
			<Ancestors ancestors={up ? up : []} pageClass={cssClass} {...{handleClick, highlight}} />
			{ !isUniverse ? 
				<div className="col-xs-auto right">
					<button className={"btn "+cssClass} onClick={handleRestart}>
						<i className="fa fa-undo-alt" /> <small>Start over</small>
					</button>
					<Link to={"/universes/create?pack="+packid}>
						<button className={"btn "+cssClass}>
							<i className="fas fa-save" /> <small>Save</small>
						</button>
					</Link>
				</div>
			:
				<StyleOptions {...rest} cssClass={savedCssClass || cssClass} txt={savedTxt || txt} 
					location={`/packs/${packid}/generators`} 
					parentBG={up && up[0] && up[0].cssClas && up[0].cssClass.split(" ").find(c=>c.startsWith('bg-'))}
					parentTxt={up && up[0] && up[0].txt} 
					{...{packid, name, isa, handleChange, highlight, index, handleRestart}} />
			}
		</nav>
		{ isUniverse || desc.length ? 
			<Description {...{desc, index, handleChange, isUniverse, highlight}} /> 
		: null }
		{ isUniverse ? 
			<SearchBar {...{favorites, index}} />
		: null}
	</div>
); // rgb={window.$('#txtOptions').css('color')} 

export default Title;