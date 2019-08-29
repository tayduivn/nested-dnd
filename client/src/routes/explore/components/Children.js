import React, { useCallback } from "react";
import Child from "./Child";
import ChildAdd from "../containers/ChildAdd";

const Children = ({ index, inArr = [], handleChange, isUniverse, isLoading }) => {
	const handleDeleteLink = useCallback(
		remove => {
			return handleChange(index, "deleteLink", remove);
		},
		[handleChange, index]
	);

	// TODO: Sortablejs
	// const {isUniverse, handle}
	return (
		<div
			id="childrenGrid"
			className={`row no-gutters ${isLoading ? "--removed" : ""}`}
			index={index}
		>
			{inArr.map((child = {}, i) => (
				<Child
					key={`${child.isNew ? "isNew" : index}_${i}`}
					hasInArr={!!inArr.length}
					tweetDesc={child.desc && child.desc[0]}
					{...{ handleDeleteLink, child, i }}
				/>
			))}
			{isUniverse ? <ChildAdd index={index} handleAdd={handleChange} i={inArr.length} /> : null}
		</div>
	);
};

export default Children;
