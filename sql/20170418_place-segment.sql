-- build Place/Segment records node/edge
set search_path = bordeaux,public;
select *from places;

select s.latin, p.names_arr, s.uri from 
	sequence s join places p on s.uri=p.uri

-- get source name as label in
update places p set label = s.latin from sequence s
	where p.uri = s.uri
select * from places where label is null
-- get geometry as given by Pleiades
update places p set lat = i.lat, lng = i.lng from itin_pelagios i
	where p.uri = i.uri
-- which are missed?
select * from places where lat is null
select * from itin_pelagios where lower(quote_transcription) like 'trip%'
-- tripolis 34.449, 35.812
-- andrapa 39.1327905, 33.533769
-- create place_ids
update places set place_id = 'bor_'||recno;

-- place_id -> source, target
select * from segments
update segments s set source = p.place_id from places p
	where sourcep = p.uri;
update segments s set target = p.place_id from places p
	where targetp = p.uri;
-- view source and target lat/lng
-- drop table z_segmentgeom
select s.segment,s.source,s.target,p1.lat as lats,p1.lng as lngs,p2.lat as latt,p2.lng as lngt
	into z_segmentgeom from segments s
	join places p1 on s.source = p1.place_id
	join places p2 on s.target = p2.place_id
	order by segment;
--
SELECT AddGeometryColumn ('bordeaux','segments','geom',4326,'LINESTRING',2);
SELECT AddGeometryColumn ('bordeaux','places','geom',4326,'POINT',2);

update segments s set geom = ST_SetSRID(ST_AsText(
	ST_MakeLine(
		ST_MakePoint(z.lngs,z.lats), 
		ST_MakePoint(z.lngt,z.latt)
	)),4326) from z_segmentgeom z
	where s.segment=z.segment;

update places set geom = ST_SetSRID(ST_MakePoint(lng,lat),4326)



