-- make places.csv for LinkedPlaces
-- 'collection', 'place_id', 'toponym', 'gazetteer_uri', 'gazetteer_label', 'lng', 'lat'
set search_path = bordeaux,public;
-- exclude places w/no geometry (not valid GeoJSON)
select 'bor' as collection,place_id,label as toponym,uri as gazetteer_uri,
	label as gazetteer_label,lng,lat from places
	where lng is not null;

-- make segments.csv
-- 'collection', 'route_id', 'segment_id', 'source', 'target', 'label', 'geometry', \
                                           -- 'timespan', 'duration','follows'
-- exclude segments with no geometry (not valid GeoJSON)
select 'bor' as collection, '7000' as route_id, '7000-'||segment as segment_id,
	source, target, sourcen||'->'||targetn as label, st_asgeojson(geom) as geometry,
	'0333-01-01,,,0334-12-31' as timespan,'?' as duration,
	'7000-'||segment-1 as follows, distance||' '||unit||'s' as distance
	from segments
	where geom is not null
-- 15 missing places
select * from places where label = 'bona mansio'
select segment, source,sourcen,target,targetn from segments where
	source is null or target is null order by segment

insert into places(place_id,label)
VALUES
('bor_296','foro domiti'),
('bor_297','ad sextum'),
('bor_298','bona mansio'),
('bor_299','alusore'),
('bor_300','tugugero'),
('bor_301','regio'),
('bor_302','tutaio'),
('bor_303','fines'),
('bor_304','platanus'),
('bor_305','baccaias'),
('bor_306','catelas'),
('bor_307','spiclin'),
('bor_308','basiliscum'),
('bor_309','calamon'),
('bor_310','certha')