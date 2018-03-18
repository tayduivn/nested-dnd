

![David](https://david-dm.org/cattegy/nested-dnd.svg)
![Code Climate](https://img.shields.io/codeclimate/github/cattegy/nested-dnd.svg)


# Nested D&D

https://nested-dnd.herokuapp.com

react-scripts .. webpack.config.dev.js
``  js
	devtoolModuleFilenameTemplate: info =>{
    	var resourcepath = path.resolve(info.absoluteResourcePath);
    	if(!resourcepath.startsWith("C:")){
    		resourcepath = "C:/git/cattegy-git/nested-dnd/client/"+resourcepath;
    	}
    	return ("file:///"+resourcepath).replace(/\\/g, '/')
    }
``

open static/js/bundle

yalc publish 
yalc add react-scripts