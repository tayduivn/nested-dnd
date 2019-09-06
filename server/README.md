# API

`explore/universe/:universe/:index? GET` - Get a specific index of a universe or the last saw. Will
complete a `todo` item with its children. Returns item, ancestors, children, universe, and pack. If
todo, gets generators and table. Index, not instance ID _Similar_

`explore/pack/:url/:isa? GET` - **TODO** If no isa, gets the root. Ancestor data? Post every time?
_Similar_

`packs GET` - Gets all the packs you have access to, including public packs.

`packs/:url/options GET` - Gets generators and tables for this pack (and all dependencies).

`universes GET` - Gets all universes you have access to

`universes POST` - Create a universe

`universes/:universe GET` - For use in the view universe backend page. Gets universe and its packs,
tables, and generators. No instances, not for exploring a universe

`universes/:universe PUT` - Edit a universe metadata (not instances)

`universes/:universe DELETE` - Delete a universe and all its instances, also its private pack and
all the generators in that pack and the tables in that pack. **TODO**

`universes/:universe/pack POST` - Make a new pack specific to this universe, so we can edit it.

`universes/:universe/instances PUT` - Change multiple instances

`universes/:universe/instances/:instance PUT` - Makes a new child on the instance _Similar_

`universes/:universe/instances/:instance DELETE` - Deletes the instance
