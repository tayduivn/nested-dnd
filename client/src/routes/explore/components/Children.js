import React, { useCallback } from "react";
import Child from "./Child";

const Children = ({ index, inArr = [], handleAdd, handleChange }) => {
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

export default Children;
