import React from "react";
import { Creatable } from "react-select";
import { FixedSizeList as List } from "react-window";

function convertOptions(arr) {
	if (!(arr instanceof Array) || typeof arr[0] !== "string") return arr;
	return arr.map(o => {
		return {
			label: o,
			value: o
		};
	});
}

const height = 30;

class MenuList extends React.Component {
	render() {
		const { options, children, maxHeight, getValue } = this.props;
		const [value] = getValue();
		const initialOffset = options.indexOf(value) * height;

		return (
			<List
				height={isNaN(maxHeight) ? height : maxHeight}
				itemCount={children.length}
				itemSize={height}
				initialScrollOffset={initialOffset}
			>
				{({ index, style }) => (
					<div className="text-option" style={style}>
						{children[index]}
					</div>
				)}
			</List>
		);
	}
}

const IsASelect = ({ options, ...props }) => (
	<Creatable
		className="isaSelect"
		components={{ MenuList }}
		options={convertOptions(options)}
		{...props}
	/>
);

export default IsASelect;
export { MenuList };
