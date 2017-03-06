-- CREATE segments
-- 'collection', 'route_id', 'segment_id', 'source', 'target', 'label', 'geometry',
	-- 'timespan', 'duration','follows'
-- drop table segments
select 'owtrad'::varchar(6) AS collection, 'afr_'||earlydate::text||'-'||latedate AS route_id, 
	'afr_'||earlydate::text||'-'||latedate||'_'||id::text AS segment_id,
	nodeid1::varchar AS source,nodeid2::varchar AS target,
	node1||'_'||node2||' ('||earlydate||'-'||latedate||')' AS label,
	array[[long1,lat1],[long2,lat2]] AS geometry, --,earlydate,latedate,
	'['||earlydate||',,,'||latedate||',]' AS timespan,''::varchar AS duration,
	''::varchar AS follows,
	dataid::varchar(64),
	uses::varchar(64),type::varchar(64),role::varchar(64),goods1::varchar(64),goods2::varchar(64),goods3::varchar(64),
	dir::varchar(64),dist::varchar(64),travmode::varchar(64),travtime::varchar(64),dataqlty::varchar(64),
	src::varchar(64),probl::varchar(64)
	into segments
	from africa_routes;
ALTER TABLE public.segments
  ADD CONSTRAINT segments_pkey PRIMARY KEY(segment_id);
SELECT AddGeometryColumn ('public','segments','geom_places',4326,'LINESTRING',2);
SELECT AddGeometryColumn ('public','segments','geom_segments',4326,'LINESTRING',2);

-- CLEAR AND REMAKE segments; delete from segments
-- africa
insert into segments(collection,route_id,segment_id,source,target,label,geometry,
	timespan,duration,follows,dataset,uses,type,role,goods1,goods2,goods3,dir,dist,
	travmode,travtime,dataqlty,src,probl)
select 'owtrad'::varchar(6) AS collection, 'afr_'||earlydate::text||'-'||latedate AS route_id, 
	'afr_'||earlydate::text||'-'||latedate||'_'||id::text AS segment_id,
	nodeid1 AS source,nodeid2 AS target,
	node1||'_'||node2||' ('||earlydate||'-'||latedate||')' AS label,
	array[[long1,lat1],[long2,lat2]] AS geometry, --,earlydate,latedate,
	'['||earlydate||',,,'||latedate||',]' AS timespan,'' AS duration,
	'' AS follows,
	dataid::varchar(64),
	uses,type,role,goods1,goods2,goods3,dir,dist,travmode,travtime,dataqlty,src,probl
	from africa_routes;
	
-- now asia and europe
insert into segments(collection,route_id,segment_id,source,target,label,geometry,
	timespan,duration,follows,dataset,uses,type,role,goods1,goods2,goods3,dir,dist,
	travmode,travtime,dataqlty,src,probl)
select 'owtrad'::varchar(6) AS collection, 'afr_'||earlydate::text||'-'||latedate AS route_id, 
	'asia_'||earlydate::text||'-'||latedate||'_'||id::text AS segment_id,
	nodeid1 AS source,nodeid2 AS target,
	node1||'_'||node2||' ('||earlydate||'-'||latedate||')' AS label,
	array[[long1,lat1],[long2,lat2]] AS geometry, --,earlydate,latedate,
	'['||earlydate||',,,'||latedate||',]' AS timespan,'' AS duration,
	'' AS follows,
	dataid::varchar(64),
	uses,type,role,goods1,goods2,goods3,dir,dist,travmode,travtime,dataqlty,src,probl
	from asia_routes;
	
insert into segments(collection,route_id,segment_id,source,target,label,geometry,
	timespan,duration,follows,dataset,uses,type,role,goods1,goods2,goods3,dir,dist,
	travmode,travtime,dataqlty,src,probl)
select 'owtrad'::varchar(6) AS collection, 'afr_'||earlydate::text||'-'||latedate AS route_id, 
	'eur_'||earlydate::text||'-'||latedate||'_'||id::text AS segment_id,
	nodeid1 AS source,nodeid2 AS target,
	node1||'_'||node2||' ('||earlydate||'-'||latedate||')' AS label,
	array[[long1,lat1],[long2,lat2]] AS geometry, --,earlydate,latedate,
	'['||earlydate||',,,'||latedate||',]' AS timespan,'' AS duration,
	'' AS follows,
	dataid::varchar(64) as dataset,
	uses,type,role,goods1,goods2,goods3,dir,dist,travmode,travtime,dataqlty,src,probl
	from europe_routes;

-- now geometry to view in QGIS; compare geometry sources
update segments set geom_segments = 
  ST_GeomFromText('LINESTRING('||geometry[1][1]||' '||geometry[1][2]||','||
  geometry[2][1]||' '||geometry[2][2]||')',4326)
  
-- from places/gazetteer
update segments set geom_places = 
  ST_GeomFromText('LINESTRING('||geometry[1][1]||' '||geometry[1][2]||','||
  geometry[2][1]||' '||geometry[2][2]||')',4326)

select s.source, array[p1.long, p1.lat] as sgeom, 
	s.target, array[p2.long, p2.lat] as tgeom from segments s 
	join places p1 on s.source=p1.placeid
	join places p2 on s.target=p2.placeid
limit 100;