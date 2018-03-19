[![David](https://david-dm.org/cattegy/nested-dnd.svg)](https://david-dm.org/cattegy/nested-dnd)
[![Maintainability](https://api.codeclimate.com/v1/badges/1e5f831c6ccb0e23fad1/maintainability)](https://codeclimate.com/github/cattegy/nested-dnd/maintainability)
[![Test Coverage](https://api.codeclimate.com/v1/badges/1e5f831c6ccb0e23fad1/test_coverage)](https://codeclimate.com/github/cattegy/nested-dnd/test_coverage)
[![bitHound Overall Score](https://www.bithound.io/github/cattegy/nested-dnd/badges/score.svg)](https://www.bithound.io/github/cattegy/nested-dnd)

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
depcheck
