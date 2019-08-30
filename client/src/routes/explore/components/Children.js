import React, { useCallback } from "react";

import Child from "./Child";
import ChildAdd from "../containers/ChildAdd";
import { ADD, DELETE_LINK } from "util/const";
import Loading from "components/Loading";
import styles from "./Children.module.scss";

const Children = ({ index, inArr = [], handleChange, isUniverse, isLoading, tempChildren }) => {
	const handleDeleteLink = useCallback(
		remove => {
			return handleChange({ [DELETE_LINK]: remove });
		},
		[handleChange]
	);

	const handleAdd = useCallback(
		child => {
			handleChange({ [ADD]: child });
		},
		[handleChange]
	);

	// TODO: Sortablejs
	// const {isUniverse, handle}
	return (
		<div className={`${styles.root}`}>
			{isLoading ? (
				<Loading.Icon />
			) : (
				<>
					{inArr.map((child = {}, i) => (
						<Child
							key={`${index}_${i}`}
							hasInArr={child.inArr && child.inArr.length}
							tweetDesc={child.desc && child.desc[0]}
							{...{ handleDeleteLink, child, i }}
						/>
					))}
					{tempChildren.map((child = {}, i) => (
						<Child key={`${index}_NEW_${i}`} {...{ child, i }} isSaving={true} />
					))}
					{isUniverse ? <ChildAdd index={index} handleAdd={handleAdd} i={inArr.length} /> : null}
				</>
			)}
		</div>
	);
};

export default Children;
