[![David](https://david-dm.org/cattegy/nested-dnd.svg)](https://david-dm.org/cattegy/nested-dnd)
[![Maintainability](https://api.codeclimate.com/v1/badges/1e5f831c6ccb0e23fad1/maintainability)](https://codeclimate.com/github/cattegy/nested-dnd/maintainability)
[![codecov](https://codecov.io/gh/cattegy/nested-dnd/branch/master/graph/badge.svg)](https://codecov.io/gh/cattegy/nested-dnd)
[![Build Status](https://travis-ci.org/cattegy/nested-dnd.svg?branch=master)](https://travis-ci.org/cattegy/nested-dnd)

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

mongodump --db nested-dnd --out server/data/dump
mongorestore -h <:> -d <heroku_> -u <user> -p <pw> server/data/dump/nested-dnd
mongorestore -h <:mlab.com> -d <dbname> -u <user> -p <password> <input .bson file> // collection

mongoexport --db nested-dnd -c generators > server/data/dump/nested-dnd/generators.json
mongoimport --db nested-dnd -c generators --upsert server/data/dump/nested-dnd/generators.json
mongo nested-dnd
db.builtpacks.remove()

cd client\src\assets\patterns && dir /b > patternNames.txt

ICOMOON.io

``for /d %i in (./*) do ( cd "%i" & svgo --config ../../../../../.svgo.js . & cd .. ) `` 

dir /s/n/b *.svg > icons.txt && for /F "tokens=1" %i in (icons.txt) do svgo --config ../../../.svgo.js -i %i


// get FNG
node client/public/getFNG.js

https://github.com/seiyria/gameicons-font
