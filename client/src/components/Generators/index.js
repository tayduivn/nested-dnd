import Generators from "./Generators";
import Generator from "./Generator";
import GeneratorsList from "./GeneratorsList";
import EditGenerator from "./EditGenerator";

const routes = [
	{
		path: "/create",
		isCreate: true,
		private: true,
		component: EditGenerator
	},
	{
		path: "/:generator",
		component: Generator,
		routes: [
			{
				path: "/edit",
				private: true,
				component: EditGenerator
			}
		]
	}
];

export default Generators;
export { GeneratorsList, Generator, EditGenerator, routes };
