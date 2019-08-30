import React, { useCallback } from "react";

import IconSelectModal from "./ModalIconSelect";
import MoveModal from "./MoveModal";
import PatternSelectModal from "./PatternSelectModal";
import Data from "../components/Data";

export default function Modals({
	data,
	showModal,
	toggleModal,
	handleChange,
	index,
	icon = {},
	cls = "",
	txt,
	parent
}) {
	const closeModal = useCallback(() => {
		toggleModal(false);
	}, [toggleModal]);

	if (!showModal) return null;

	switch (showModal) {
		case "MOVE":
			return <MoveModal key={index + "move"} {...{ handleChange, index, parent, closeModal }} />;
		case "ICON":
			return (
				<IconSelectModal
					key={index + "icon"}
					{...{ ...icon, handleChange, cls, txt, index, closeModal }}
				/>
			);
		case "DATA":
			return <Data key={index + "data"} {...{ data, handleChange, closeModal }} />;
		case "PATTERN":
			const bg = cls.split(" ").find(c => c.startsWith("bg-"));
			const ptn = cls.split(" ").find(c => c.startsWith("ptn-"));
			return (
				<PatternSelectModal
					key={index + "pattern"}
					{...{ handleChange, index, closeModal, bg, ptn }}
				/>
			);
		default:
			return null;
	}
}
