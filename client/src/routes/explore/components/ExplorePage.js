import React, { useCallback } from "react";

import Child from "./Child";
import Icon from "components/Icon";
import Isa from "./Isa";
import MixedKeyValue from "components/Form/MixedKeyValue";
import IconSelectModal from "./ModalIconSelect";
import MoveModal from "./MoveModal";
import PatternSelectModal from "./PatternSelectModal";
import "./ExplorePage.scss";

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
		const { handleChange, index, icon = {}, cssClass = "", txt, parent } = this.props;
		return (
			<React.Fragment>
				<MoveModal key={index + "move"} handleChange={handleChange} index={index} up={parent} />
				<IconSelectModal
					key={index + "icon"}
					{...{ ...icon, handleChange, cssClass, txt, index }}
				/>
				<PatternSelectModal
					key={index + "pattern"}
					handleChange={handleChange}
					bg={cssClass.split(" ").find(c => c.startsWith("bg-"))}
					ptn={cssClass.split(" ").find(c => c.startsWith("ptn-"))}
					index={index}
				/>
			</React.Fragment>
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
		className={`explorePage main container-fluid ${cssClass}`}
		data-bg={cssClass}
		style={{ color: txt }}
	>
		{children}
	</div>
);

const Children = ({ isUniverse, index, inArr = [], handleAdd, handleChange }) => {
	const handleDeleteLink = useCallback(
		remove => {
			return handleChange(index, "deleteLink", remove);
		},
		[handleChange, index]
	);

	// TODO: Sortablejs
	// const {isUniverse, handle}
	return (
		<div id="childrenGrid" className="row no-gutters" index={index}>
			{inArr.map((child, i) => (
				<Child
					key={`${child.isNew ? "isNew" : index}_${i}`}
					hasInArr={!!inArr.length}
					tweetDesc={child.desc && child.desc[0]}
					{...{ handleAdd, handleDeleteLink, child, i }}
				/>
			))}
		</div>
	);
};

export default ExplorePage;
export { LOADING, Icon, Isa, Data, Children, Modals };
