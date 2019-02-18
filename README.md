[![David](https://david-dm.org/jsabol/nested-dnd.svg)](https://david-dm.org/jsabol/nested-dnd)
[![Maintainability](https://api.codeclimate.com/v1/badges/cfc72675a003187893e5/maintainability)](https://codeclimate.com/github/jsabol/nested-dnd/maintainability)
[![codecov](https://codecov.io/gh/cattegy/nested-dnd/branch/master/graph/badge.svg)](https://codecov.io/gh/cattegy/nested-dnd)
[![Build Status](https://travis-ci.org/jsabol/nested-dnd.svg?branch=master)](https://travis-ci.org/jsabol/nested-dnd)

# [Nested D&D](https://nested-dnd.herokuapp.com)

# Installation

- `npm install -g yarn`
- Install [MongoDB](https://www.mongodb.com/download-center/community)
- Create empty folder under /server/data
- run `npm install`
- git clone
- cd `npm install --production`

## Check dependencies

`depcheck`

## Database import/export commands

mongodump --db nested-dnd --out server/data/dump
mongorestore -h <:> -d <heroku\_> -u <user> -p <pw> server/data/dump/nested-dnd
mongorestore -h <:mlab.com> -d <dbname> -u <user> -p <password> <input .bson file> // collection

mongoexport --db nested-dnd -c generators > server/data/dump-json/nested-dnd/generators.json
mongoimport --db nested-dnd -c generators --upsert server/data/dump-json/nested-dnd/generators.json
mongo nested-dnd
db.builtpacks.remove()

## Build patterns

cd client\src\assets\patterns && dir /b > patternNames.txt

## Build icons

- ICOMOON.io

`for /d %i in (./*) do ( cd "%i" & svgo --config ../../../../../.svgo.js . & cd .. )`

`dir /s/n/b *.svg > icons.txt && for /F "tokens=1" %i in (icons.txt) do svgo --config ../../../.svgo.js -i %i`

https://github.com/seiyria/gameicons-font

## Get fantasy name generators

// get FNG
node client/public/getFNG.js

## Instance names that aren't favorites

const results = {};
temp1.array.forEach((instance, index) => !temp1.favorites.includes(index) && instance.name && (results[instance.name] = index));
Object.keys(results).map(r=>`${r} | ${results[r]}`).sort().join('\n');
