import React from "react";
//import { TransitionGroup, CSSTransition } from "react-transition-group";
import ReactSortable from "react-sortablejs";

import Child from "./Child";
import Icon from "./Icon";
import Isa from "./Isa";
import { MixedKeyValue } from "../Form/MixedThing";
import IconSelectModal from "./ModalIconSelect";
import MoveModal from "./MoveModal";
import PatternSelectModal from "./PatternSelectModal";

/*const TRANSITION_OPTIONS = {
	classNames: "slide-up",
	appear: true,
	exit: true
};*/

const LOADING = (
	<div className="child col">
		<div className="child-inner loader">
			<i className="loading fa fa-spinner fa-spin" />
		</div>
	</div>
);

class Modals extends React.Component {
	shouldComponentUpdate(nextProps) {
		const next = { ...nextProps, handleChange: undefined };
		const current = { ...this.props, handleChange: undefined };
		return JSON.stringify(next) !== JSON.stringify(current);
	}
	render() {
		const { handleChange, index, icon, cssClass = "", txt, parent } = this.props;
		return (
			<div>
				<MoveModal handleChange={handleChange} index={index} up={parent} />
				<IconSelectModal {...{ handleChange, icon, cssClass, txt, index }} />
				<PatternSelectModal
					handleChange={handleChange}
					bg={cssClass.split(" ").find(c => c.startsWith("bg-"))}
					ptn={cssClass.split(" ").find(c => c.startsWith("ptn-"))}
					index={index}
				/>
			</div>
		);
	}
}

const DATA_OPTIONS = {
	property: "data",
	types: ["string", "generator", "table_id", "embed", "json", "table"]
};

const Data = ({ data, generators, tables, handleChange, index }) => (
	<MixedKeyValue
		map={data}
		options={DATA_OPTIONS}
		{...{ generators, tables }}
		handleChange={(prop, val) => handleChange(index, prop, val)}
	/>
);

const ExplorePage = ({ cssClass, txt, children }) => (
	<div
		id="explorePage"
		className={`main container-fluid ${cssClass}`}
		data-bg={cssClass}
		style={{ color: txt }}
	>
		{children}
	</div>
);

const SortableList = ({ handlechange, index, ...props }) => (
	<ReactSortable
		{...props}
		options={{
			animation: 300,
			group: "children",
			filter: ".isNew", //ignore
			onEnd: evt => {
				handlechange(index, "sort", { from: evt.oldIndex, to: evt.newIndex });
			}
		}}
	/>
);

const TRANSITION_GROUP_SETTINGS = {
	id: "childrenGrid",
	className: "row no-gutters",
	animation: 10
};

/*class Children2 extends React.PureComponent {
	handleDeleteLink(remove) {
		return this.props.handle.change(this.props.index, "deleteLink", remove);
	}
	render() {
		const { isUniverse, index, inArr = [], cssClass, handle, highlightColor } = this.props;
		return (
			<TransitionGroup
				{...{ index, ...TRANSITION_GROUP_SETTINGS }}
				handlechange={isUniverse ? handle.change : undefined}
				component={isUniverse ? SortableList : "div"}
			>
				{inArr.map((c, i) => (
					<CSSTransition
						key={c.index || i}
						timeout={{ enter: 30 * i + 500, exit: 1 }}
						{...TRANSITION_OPTIONS}
					>
						<Child
							{...{ i, highlight: highlightColor, ...c }}
							in={c.in || isUniverse ? [] : undefined}
							transparentBG={c.cssClass === cssClass}
							handleClick={c.isNew ? handle.add : handle.click}
							handleDeleteLink={this.handleDeleteLink}
							isLink={c.up && c.up[0] && c.up[0].index !== index}
						/>
					</CSSTransition>
				))}
			</TransitionGroup>
		);
	}
}*/

class Children extends React.Component {
	handleDeleteLink(remove) {
		return this.props.handle.change(this.props.index, "deleteLink", remove);
	}
	shouldComponentUpdate(nextProps) {
		const current = { ...this.props, generators: undefined };
		const next = { ...nextProps, generators: undefined };
		return (
			JSON.stringify(current) !== JSON.stringify(next) ||
			JSON.stringify(current.inArr) !== JSON.stringify(next.inArr) ||
			JSON.stringify(this.props.generators) !== JSON.stringify(nextProps.generators)
		);
	}
	_getProps(c, i) {
		const { cssClass, handle, highlightColor } = this.props;
		const { generators } = this.props;

		return {
			highlight: highlightColor,
			generators: c.isNew ? generators : undefined,
			...c,
			transparentBG: c.cssClass === cssClass && cssClass && cssClass.includes("ptn-"),
			handleClick: c.isNew ? handle.add : handle.click,
			handleDeleteLink: this.handleDeleteLink,
			in: c.in && c.in.join && c.in.join(","),
			desc: c.desc && c.desc.join("\n"),
			i
		};
	}
	render() {
		const { isUniverse, index, inArr = [], handle } = this.props;
		//const inArr2 = inArr.filter(child => !child.isNew);
		//const newChild = inArr2.length !== inArr.length ? inArr[inArr.length - 1] : null;
		return (
			<div>
				<SortableList
					{...{ index, ...TRANSITION_GROUP_SETTINGS }}
					handlechange={isUniverse ? handle.change : undefined}
				>
					{inArr.map((c, i) => (
						<Child key={`${c.index}_${i}`} {...this._getProps(c, i)} />
					))}
				</SortableList>
			</div>
		);
	}
}

export default ExplorePage;
export { LOADING, Icon, Isa, Data, Children, Modals };
