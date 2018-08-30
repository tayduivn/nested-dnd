import colors from 'material-colors';

colors.wood = {
	'50': '#f6ede0',
	'100': '#e9d2b3',
	'200': '#dbb480',
	'300': '#cd964d',
	'400': '#c28026',
	'500': '#b76900',
	'600': '#b06100',
	'700': '#a75600',
	'800': '#9f4c00',
	'900': '#903b00',
	'1000': '#441c00',
	'a100': '#ffd2bc',
	'a200': '#ffb089',
	'a400': '#ff8d56',
	'a700': '#ff7c3c',
}

colors.red['1000'] = '#751212';
colors.pink['1000'] = '#430727';
colors.purple['1000'] = '#270a49';
colors.deepPurple['1000'] = '#1b0f51';
colors.indigo['1000'] = '#0d113f';
colors.blue['1000'] = '#07285a';
colors.lightBlue['1000'] = '#012c4f';
colors.cyan['1000'] = '#001718';
colors.teal['1000'] = '#000100';
colors.green['1000'] = '#0a230c';
colors.lightGreen['1000'] = '#162e0d';
colors.lime['1000'] = '#413c0c';
colors.yellow['1000'] = '#b85a08';
colors.amber['1000'] = '#b34e00';
colors.orange['1000'] = '#9a3600';
colors.deepOrange['1000'] = '#772207';
colors.brown['1000'] = '#0d0807';
colors.grey['1000'] = '#000000';
colors.blueGrey['1000'] = '#07090a';

var allColors = [];

colors['deep-purple'] = colors['deepPurple'];
colors['light-blue'] = colors['lightBlue'];
colors['light-green'] = colors['lightGreen'];
colors['deep-orange'] = colors['deepOrange'];
colors['blue-grey'] = colors['blueGrey'];

var colorOrder = ['red','pink','purple','deep-purple','indigo','blue','light-blue','cyan','teal','green','light-green','lime','yellow','amber','orange','deep-orange','wood','brown','blue-grey','grey'];

colorOrder.forEach(c=>{
	for(var variant in colors[c]){
		allColors.push({
			name: c,
			variant,
			value: colors[c][variant]
		});
	}
	var count = 15-Object.keys(colors[c]).length;
	while(count-- > 0){
		allColors.push(null);
	} 
})

export default colors;
export { colorOrder, allColors };