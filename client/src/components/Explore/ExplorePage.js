import React from "react";
import {TransitionGroup,  CSSTransition} from 'react-transition-group'
import SVG from 'react-inlinesvg';
import ReactSortable from 'react-sortablejs';

import Child from './Child'
import colors from '../../colors';
import { MixedKeyValue } from '../Form/MixedThing';
import Title from './Title';
import IconSelectModal, { ModalHeader } from './ModalIconSelect';

const textures = ["3px-tile","45-degree-fabric-dark","45-degree-fabric-light","60-lines","ag-square","always-grey","arabesque","arches","black-scales","bright-squares","dark-mosaic","dark-wood","diagonal-striped-brick","diamond-upholstery","dimension","egg-shell","flowers","foggy-birds","food","football-no-lines","gradient-squares","gravel","gray-floral","grid-me","grunge-wall","hexellence","honey-im-subtle","inspiration-geometry","leather","light-gray","light-grey-floral-motif","light-paper-fibers","maze-black","maze-white","nestedBaconverse","nestedDoughnutverse","nestedLasagnaverse","nestedSharkverse","padded-light","pineapple-cut","pixel-weave","polaroid","purty-wood","random-grey-variations","retina-wood","robots","rocky-wall","scribble-light","shattered-dark","shley-tree-1","shley-tree-2","skulls","stardust","subtle-white-feathers","tileable-wood-colored","tileable-wood","tree-bark","type","washi","white-diamond-dark","woven-light","woven","xv"];

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
					<ModalHeader />
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
						<ModalHeader />
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

export default ExplorePage;
export { LOADING, Icon, Isa, getHighlightColor, getHighlightClass, getColor };