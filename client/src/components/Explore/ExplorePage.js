import React from "react";
import { Link } from "react-router-dom";
import {TransitionGroup,  CSSTransition} from 'react-transition-group'
import SVG from 'react-inlinesvg';
import ReactSortable from 'react-sortablejs';
import PropTypes from "prop-types";

import Ancestors from './Ancestors';
import IconSelect from '../Form/IconSelect';
import { ColorPicker, HexColorPicker } from '../Form/ColorPicker';
import Child from './Child'
import colors from '../../colors';
import { MixedKeyValue } from '../Form/MixedThing';

const textures = ["3px-tile","45-degree-fabric-dark","45-degree-fabric-light","60-lines","ag-square","always-grey","arabesque","arches","black-scales","bright-squares","dark-mosaic","dark-wood","diagonal-striped-brick","diamond-upholstery","dimension","egg-shell","flowers","foggy-birds","food","football-no-lines","gradient-squares","gravel","gray-floral","grid-me","grunge-wall","hexellence","honey-im-subtle","inspiration-geometry","leather","light-gray","light-grey-floral-motif","light-paper-fibers","maze-black","maze-white","nestedBaconverse","nestedDoughnutverse","nestedLasagnaverse","nestedSharkverse","padded-light","pineapple-cut","pixel-weave","polaroid","purty-wood","random-grey-variations","retina-wood","robots","rocky-wall","scribble-light","shattered-dark","shley-tree-1","shley-tree-2","skulls","stardust","subtle-white-feathers","tileable-wood-colored","tileable-wood","tree-bark","type","washi","white-diamond-dark","woven-light","woven","xv"];


const CENTER_ALIGN = "d-flex align-items-center justify-content-center";
const VERTICAL_ALIGN = "d-flex align-items-center";


const TRANSITION_OPTIONS = {
	classNames: "slide-up",
	appear: true,
	exit: true
};
const LOADING = (
	<div className="child col">
		<div className="child-inner loader">
			<i className="loading fa fa-spinner fa-spin"></i>
		</div>
	</div>);

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

function getColor(cssClass){
	var { name, variant } = getParts(cssClass, true);
	return (colors[name]) ? colors[name][variant] : cssClass;
}

function getParts(cssClass = "", dontShift){
	var bg = cssClass.split(" ").find(c=>c.startsWith('bg-'));
	if(!bg) return { name: '', variant: ''}
	var parts = bg.split("-")
	parts.splice(0, 1); // remove bg-
	var variant = parts[parts.length-1];
	parts.splice(parts.length-1, 1);

	if(!variant) return {parts: [cssClass]};

	if(!dontShift)
		variant = shiftColor(variant);

	return { name: parts.join("-"), variant };
}

function shiftColor(variant){
	if(variant.startsWith('a')){
		variant = variant.substr(1);
	}
	else{
		variant = parseInt(variant, 10);
		if(variant === 50) variant = 100
		else if(variant <= 500) variant += 100;
		else variant -= 100;
	}
	return variant;
}

function getHighlightClass(cssClass){
	var { name, variant } = getParts(cssClass);

	return "bg-"+name+"-"+variant;
}

function getHighlightColor(cssClass){
	var { name, variant } = getParts(cssClass);
	
	return (colors[name]) ? colors[name][variant] : cssClass;
}

const Icon = ({name = false, txt = "", alignment = "", fadeIn = true}) => {
	if(!name || !name.trim || !name.split) return null;
	name = name.trim();
	var parts = name.split(" ");
	if(parts[0] === 'svg'){
		name = name.substr(4);
		return (
			<span className={alignment+(fadeIn?' animated fadeIn':'')}>
				<SVG className={`icon animated infinite ${parts[2]} ${parts[1]}`} 
					alt={`/icons/${parts[1]}.svg`} //for debugging
					src={`/icons/${parts[1]}.svg`} 
					cacheGetRequests={true} 
					preloader={<span></span>} />
			</span>
		)
	}
	else if(parts[0] === 'text'){
		return <div className="icon text">{parts[1]}</div>;
	}
	else if(name.startsWith("fa")){
		return <i className={"icon animated infinite "+name+" "+alignment}></i>
	}
	else if(name && name.length && name !== 'undefined'){
		return <div className="icon" style={{'backgroundImage': `url(${name})`}} />;
	}
	else return <span className="icon" />;
}

const Isa = ({name, isa}) => {
	if(!isa || !name) return null;

	var capName = name && name.toUpperCase().trim();
	var capIsa = isa && isa.toUpperCase().trim();
	if(name 
		&& capName !== capIsa
		&& !capName.endsWith(capIsa)
		&& !capIsa.endsWith(capName)
		&& !capName.startsWith(capIsa)
		&& !capIsa.startsWith(capName) ){
		return <h2>{isa}</h2>;
	}
		
	return null;
}

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

const ExplorePage = ({ index, up, cssClass = 'bg-grey-50', icon, in: inArr, txt, isUniverse, highlight, handleClick, handleChange, handleAdd, favorites = [], generators = [], tables = [], showAdd, isa, name, pack = {}, isFavorite, data, showData, ...rest }) => (
	<div id="explorePage" className={`main container-fluid`} data-bg={cssClass} style={{color:txt}}>
		<div className="row">
			<Title {...rest} 
				isa={ generators.includes(isa) ? isa : undefined } 
				name={ isa && !generators.includes(isa) && !name ? isa : name } 
				up={up} index={index} icon={icon} packid={pack._id}
				handleClick={handleClick} handleChange={handleChange} 
				isUniverse={isUniverse} txt={txt} cssClass={cssClass} highlight={getHighlightClass(cssClass)}
				isFavorite={isFavorite} favorites={favorites} />
			<div className="col">
				{showData
				? <MixedKeyValue map={data} options={{
						property: 'data',
						types: ['string', 'generator', 'table_id', 'embed', 'json', 'table']
					}} {...{generators, tables}}
						handleChange={(prop,val)=>handleChange(index, prop, val)} />
				: null}
				{ 
					inArr === true ? LOADING : 
					!inArr && !isUniverse ? null :
					<Children arr={inArr || []} generators={generators} parentCSS={cssClass} isUniverse={isUniverse} 
						handleClick={handleClick} handleAdd={handleAdd} showAdd={showAdd} handleChange={handleChange} highlight={getHighlightColor(cssClass)} index={index} />
				}
			</div>
			
		</div>
		{isUniverse ? 
			<div>
				<MoveModal handleChange={handleChange} index={index} up={up && up[0] && up[0].index} />
				<IconSelectModal handleChange={handleChange} icon={icon} cssClass={cssClass} style={{color:txt}} index={index} />
				<PatternSelectModal handleChange={handleChange} 
					bg={cssClass.split(" ").find(c=>c.startsWith('bg-'))} 
					ptn={cssClass.split(" ").find(c=>c.startsWith('ptn-'))}
					index={index} />
			</div>
		: null}
		
	</div>
)

const SortableList = ({handlechange, index, ...props}) => (
	<ReactSortable {...props} options={{
		animation:100,
		touchStartThreshold: 40,
		group: 'children',
		onEnd: (evt)=>{
			handlechange(index, 'sort', { from: evt.oldIndex, to: evt.newIndex });
		}
	}} />
)

const Children = ({ index, arr, parentCSS, isUniverse, handleAdd, handleChange, handleClick, ...props}) => (
	<div>
		<TransitionGroup id="childrenGrid" className="row no-gutters" handlechange={isUniverse ? handleChange : undefined} component={isUniverse ? SortableList:'div'} animation={100} index={index}>
			{arr.map((c,i) => c && (
				<CSSTransition key={c.index} timeout={{enter:(30*i)+500, exit: 1}} {...TRANSITION_OPTIONS}>
					<Child i={i} {...c}
						transparentBG={c.cssClass === parentCSS} 
						handleClick={c.isNew ? handleAdd : handleClick} 
						handleDeleteLink={(remove)=>handleChange(index, 'deleteLink', remove)}
						in={c.in || (isUniverse) ? [] : undefined} isLink={c.up && c.up[0] && c.up[0].index !== index} {...props} />
				</CSSTransition>
			))}
		</TransitionGroup>
	</div>
);

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



class MoveModal extends React.Component {

	componentDidMount(){
		window.$('#moveModal').on('hide.bs.modal', this.handleClose);
	}
	handleClose = ()=>{
		const newUp = document.getElementById('moveIndex').value;
		this.props.handleChange(this.props.index, 'up', newUp);
	}
	render(){
		return (<div className="modal fade" id="moveModal" tabIndex="-1" role="dialog" aria-hidden="true">
			<div className="modal-dialog" role="document">
				<div className="modal-content">
					<div className="modal-header">
						<button type="button" className="close" data-dismiss="modal" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div className="modal-body">
						<div className="form-group">
							<label>Parent Index</label>
							<input className="form-control" id="moveIndex" defaultValue={this.props.up} />
						</div>
					</div>
				</div>
			</div>
		</div>
		)
	}
}

class PatternSelectModal extends React.Component {

	handleClick = (value) =>{
		let className = this.props.bg;
		if(value) className+=" ptn-"+value;

		this.props.handleChange(this.props.index, 'cssClass', className);
	}
	render(){
		var { bg, ptn } = this.props;
		return (
			<div className="modal fade" data-backdrop="false" id="patternSelectModal" tabIndex="-1" role="dialog" aria-hidden="true">
				<div className="modal-dialog" role="document">
					<div className={"modal-content "+bg}>
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body row">
							<div className="col-6">
								<div className="sample" onClick={()=>{this.handleClick(null)}}>
									{!ptn ? <i className="fa fa-check" /> : null}
									none
								</div>
							</div>
							{textures.map((t,i)=>(
								<div key={i} className="col-6">
									<div className={`sample ptn-${t} ${bg}`} onClick={()=>{this.handleClick(t)}}>
										{ptn === "ptn-"+t ? <i className="fa fa-check" /> : null}
										{t}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		);
	}
}

class IconSelectModal extends React.Component {

	static contextTypes = {
		sendPlayersPreview: PropTypes.func
	}
	state = {
		newValue: null,
		useImg: null,
		showTextBox: null,
	}
	constructor(){
		super();
		this.handleChange = this.handleChange.bind(this)
		this.handleClose = this.handleClose.bind(this);
	}
	componentDidMount(){
		window.$('#iconSelectModal').on('hide.bs.modal', this.handleClose);
		window.$('#iconSelectModal').on('show.bs.modal', this.handleOpen);
	}
	handleChange(value){
		this.setState({newValue: value});
	}
	handleChangeType = (e) => {
		this.setState({
			useImg: e.target.value==='true',
			showTextBox:  e.target.value==='text',
			newValue: ""
		});
	}
	handleOpen = () => {
		var icon = this.props.icon;

		this.setState({
			useImg: icon && (!(icon.startsWith("fa") || icon.startsWith("svg "))),
			showTextBox: icon && icon.startsWith("text "),
			newValue: (icon && icon.replace("text ","")) || ""
		})
	}
	handleClose(){
		if(this.state.newValue !== null){
			var newValue = this.state.newValue;
			if(this.state.showTextBox) newValue = "text "+newValue;
			this.props.handleChange(this.props.index, 'icon', newValue);
		}

		if(this.state.useImg !== null)
			this.props.handleChange(this.props.index, 'useImg', this.state.useImg);

		this.setState({newValue: null, useImg: null});
	}
	setPreview = () => {
		var icon = (this.state.newValue !== null) ? this.state.newValue : this.props.icon;
		this.context.sendPlayersPreview(icon);
	}
	render(){
		var {icon, cssClass, style } = this.props;
		var icon = this.state.newValue;
		var useImg = this.state.useImg;
		var type = (this.state.showTextBox) ? "text" : !!useImg;

		return (
			<div className="modal fade" id="iconSelectModal" tabIndex="-1" role="dialog" aria-hidden="true">
				<div className="modal-dialog" role="document">
					<div className="modal-content">
						<div className="modal-header">
							<button type="button" className="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div className="modal-body">
							<select value={type} className="input-transparent" onChange={this.handleChangeType}>
								<option value={false}>Icon</option>
								<option value="text">Text</option>
								<option value={true}>Image</option>
							</select>
							{ useImg ?
								<div>
									<button className="btn btn-default" onClick={this.setPreview}>Show to players</button>
									<a href="/players-preview">Player view</a>
									<br />
									<img src={icon} alt="Preview" />
									<input className="form-control" value={icon} onChange={(e)=>this.handleChange(e.target.value)} />
								</div>
							: ( this.state.showTextBox ? 
								<div>
									<input className="form-control" value={icon} onChange={(e)=>this.handleChange(e.target.value)} />
								</div>
							: <IconSelect status={{isEnabled: true}} value={this.state.newValue || icon} cssClass={cssClass} style={style} saveProperty={this.handleChange} setPreview={()=>{}} />
							)}
							
						</div>
					</div>
				</div>
			</div>
		);
	}
}

export default ExplorePage;
export { LOADING, Icon, Isa, getHighlightColor, getHighlightClass, getColor };