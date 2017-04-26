--'collection', 'place_id', 'toponym', 'gazetteer_uri', 'gazetteer_label', 'lng', 'lat'
-- 
CREATE TABLE public.places
(
  recno serial,
  dataset character varying(20),
  place_id character varying(12),
  geonames_id integer,
  pleiades_id integer,
  toponym  character varying(100),
  gazetteer_uri character varying,
  gazetteer_label character varying(50),
  names_arr character varying,
  lng double precision,
  lat double precision,
  CONSTRAINT places_pkey PRIMARY KEY (recno)
)
WITH (
  OIDS=FALSE
);
ALTER TABLE public.places
  OWNER TO karlg;
-- ALTER TABLE public.places
--   ADD CONSTRAINT uniq_gaz_uri UNIQUE(gazetteer_uri);
-- bordeaux
insert into places(dataset,place_id,toponym,gazetteer_uri,gazetteer_label,lng,lat)
	select 'bordeaux',place_id,label,uri,label,lng,lat
	from bordeaux.places
-- vicarello
insert into places(dataset,place_id,toponym,gazetteer_uri,gazetteer_label,lng,lat)
	select 'vicarello',place_id,toponym,gazetteer_uri,gazetteer_label,lng,lat
	from vicarello.places
-- xuanzang
insert into places(dataset,place_id,toponym,gazetteer_uri,gazetteer_label,lng,lat,geonames_id)
	select 'xuanzang',place_id,toponym,gazetteer_uri,gazetteer_label,
	lng::double precision,lat::double precision,geonames_id
	from xuanzang.places
-- courier
insert into places(dataset,place_id,toponym,gazetteer_uri,gazetteer_label,lng,lat)
	select 'courier',place_id,toponym,gazetteer_uri,gazetteer_label,lng,lat
	from courier.places
-- incanto
insert into places(dataset,place_id,toponym,gazetteer_uri,gazetteer_label,lng,lat,geonames_id)
	select 'incanto',place_id,toponym,gazetteer_uri,gazetteer_label,lng,lat,geonames_id
	from incanto.places
-- owtrad
insert into places(dataset,place_id,toponym,gazetteer_uri,gazetteer_label,lng,lat)
	select 'owtrad',place_id,toponym,gazetteer_uri,gazetteer_label,lng,lat
	from owtrad.places
-- roundabout
insert into places(dataset,place_id,toponym,gazetteer_uri,gazetteer_label,lng,lat,geonames_id)
	select 'roundabout',place_id,toponym,gazetteer_uri,gazetteer_label,lng,lat,geonames_id
	from roundabout.places
-- duplicates to be conflated
with z as (
select gazetteer_uri, count(*) from places 
	group by gazetteer_uri order by count desc
) select z.gazetteer_uri,p.toponym from z 
	join places p on z.gazetteer_uri=p.gazetteer_uri
	where count > 1