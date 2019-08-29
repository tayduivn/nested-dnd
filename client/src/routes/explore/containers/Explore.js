import React, { useState, useCallback, useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import ExplorePage from "../components/ExplorePage";
import Data from "../components/Data";
import Modals from "../components/Modals";
import Children from "../components/Children";
import Title from "./Title";
import Loading from "components/Loading";
import {
	loadCurrent,
	selectAncestorsAndStyle,
	getInArr,
	getUniverse,
	changeInstance
} from "store/universes";
import { loadFonts } from "store/fonts";

// TODO: use reselect so we don't calculate current every time
function mapStateToProps(state) {
	let { universe, universeId, pack, index, isUniverse, isLoaded } = getUniverse(state);

	let current, currentId, instance, inArr, ancestors;
	if (universe) {
		currentId = universe.array[index];
		instance = state.universes.instances[currentId];
	}
	if (instance) {
		// we have to copy it since we're going to modify it
		current = { ...instance };
		const { cls, txt, up } = selectAncestorsAndStyle(currentId, state.universes.instances);
		if (!current.cls) {
			current.cls = cls;
			current.txt = txt;
		}
		inArr = getInArr(current, state.universes.instances);
		ancestors = up;
	}
	return {
		universe,
		universeId,
		index,
		currentId,
		current,
		isUniverse,
		inArr,
		ancestors: ancestors,
		font: pack && pack.font,
		isLoading: !isLoaded
	};
}

/**
 * This manages the tree data
 */
function Explore({
	index,
	universe = {},
	current = false,
	currentId,
	favorites,
	isUniverse,
	inArr,
	ancestors = [],
	universeId,
	isLoading,
	font
}) {
	const [showData, setShowData] = useState(false);
	const dispatch = useDispatch();
	const { isa, name } = current || {};

	useEffect(() => {
		dispatch(loadCurrent(index));
	}, [dispatch, index]);

	useEffect(() => {
		if (font) dispatch(loadFonts([font]));
	}, [dispatch, font]);

	useEffect(() => {
		document.title = isa || name || "Explore";
	}, [isa, name]);

	const toggleFavorite = useCallback(() => {}, []);

	const toggleData = useCallback(() => {
		setShowData(!showData);
	}, [showData]);

	// property should be "add" to add a new thing
	const handleChange = useCallback(
		(p, v) => {
			dispatch(changeInstance(universeId, currentId, p, v));
		},
		[dispatch, currentId, universeId]
	);

	if (!current) return <Loading.Page />;

	const packid = universe.pack;
	const { icon, cls, txt, parent } = current;
	return (
		<>
			<ExplorePage cls={current.cls} txt={current.txt}>
				<div className="row">
					<Title
						key={index}
						{...{
							current,
							packid,
							isUniverse,
							favorites,
							universeId,
							ancestors,
							handleChange,
							font
						}}
					/>
					<div className={`children col ${isUniverse ? "children--universe" : ""}`}>
						{showData && <Data {...{ data: current.data, handleChange, index }} />}
						{isLoading ? <Loading.Page /> : null}
						{/* we don't want to remount this so the add child can stay forever */}
						<Children {...{ isUniverse, inArr, index, handleChange, isLoading }} />
					</div>
				</div>
			</ExplorePage>
			{isUniverse && <Modals {...{ handleChange, index, icon, cls, txt, parent }} />}
		</>
	);
}

const Container = connect(mapStateToProps)(Explore);

export default Container;
