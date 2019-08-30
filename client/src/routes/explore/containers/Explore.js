import React, { useState, useCallback, useEffect } from "react";
import { connect, useDispatch } from "react-redux";

import ExplorePage from "../components/ExplorePage";
import Modals from "../components/Modals";
import Children from "../components/Children";
import Title from "./Title";
import Loading from "components/Loading";
import {
	loadCurrent,
	selectAncestorsAndStyle,
	getInArr,
	getUniverse,
	changeInstance,
	addChild,
	deleteInstance
} from "store/universes";
import { loadFonts } from "store/fonts";
import getHighlight from "store/universes/selectors/getHighlight";

// TODO: use reselect so we don't calculate current every time
function mapStateToProps(state) {
	let { universe, universe_id, pack, index, isUniverse, isLoaded } = getUniverse(state);

	let current, instance_id, instance, inArr, ancestors, tempChildren;
	if (universe) {
		instance_id = universe.array[index];
		instance = state.universes.instances[instance_id];
	}
	if (instance) {
		// we have to copy it since we're going to modify it
		current = { ...instance };
		const { cls, txt, up } = selectAncestorsAndStyle(instance_id, state.universes.instances);
		if (!current.cls) {
			current.cls = cls;
			current.txt = txt;
		}
		inArr = getInArr(current, state.universes.instances);
		ancestors = up;
		const tempChilds = state.universes.tempChildren;
		tempChildren = tempChilds[universe_id] && tempChilds[universe_id][instance_id];
	}
	return {
		universe,
		universe_id,
		index,
		instance_id,
		current,
		isUniverse,
		inArr,
		tempChildren,
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
	instance_id,
	favorites,
	isUniverse,
	inArr,
	ancestors = [],
	universe_id,
	isLoading,
	tempChildren = [],
	font
}) {
	const [showModal, setShowModal] = useState(false);
	const [highlight, setHighlight] = useState({});
	const dispatch = useDispatch();
	const { isa, name, cls, parent, icon, txt } = current || {};
	const pack_id = universe.pack;

	useEffect(() => {
		setHighlight(getHighlight(cls));
	}, [cls]);
	useEffect(() => {
		dispatch(loadCurrent(index));
	}, [dispatch, index]);

	useEffect(() => {
		if (font) dispatch(loadFonts([font]));
	}, [dispatch, font]);

	useEffect(() => {
		document.title = isa || name || "Explore";
	}, [isa, name]);

	const toggleModal = useCallback(modalName => {
		if (!["ICON", "PATTERN", "MOVE"].includes(modalName)) setShowModal(false);
		setShowModal(modalName);
	}, []);

	// delete or restart
	const handleRestart = useCallback(() => {
		dispatch(deleteInstance(universe_id, instance_id));
	}, [dispatch, instance_id, universe_id]);

	// property should be "add" to add a new thing
	const handleChange = useCallback(
		data => {
			if (data.ADD) dispatch(addChild(universe_id, instance_id, data.ADD));
			else dispatch(changeInstance(universe_id, instance_id, data));
		},
		[dispatch, instance_id, universe_id]
	);

	if (!current) return <Loading.Page />;

	return (
		<>
			<ExplorePage cls={current.cls} txt={current.txt}>
				<Title
					key={index}
					{...{
						current,
						pack_id,
						isUniverse,
						favorites,
						universe_id,
						ancestors,
						handleChange,
						handleRestart,
						toggleModal,
						highlight,
						font
					}}
				/>
				<div className={`children col ${isUniverse ? "children--universe" : ""}`}>
					{/* we don't want to remount this so the add child can stay forever */}
					<Children
						{...{ isUniverse, inArr, index, handleChange, isLoading, tempChildren, highlight }}
					/>
				</div>
			</ExplorePage>
			{isUniverse && showModal ? (
				<Modals
					{...{
						showModal,
						toggleModal,
						handleChange,
						data: current.data,
						index,
						icon,
						cls,
						txt,
						parent
					}}
				/>
			) : null}
		</>
	);
}

const Container = connect(mapStateToProps)(Explore);

export default Container;
