ALTER TABLE bordeaux.places ADD PRIMARY KEY (recno);
set search_path = bordeaux,public

update places set name = lower(name)

alter table sequence drop CONSTRAINT sequence_pkey


with y as (
with x as (
select latin, count(*) from sequence group by latin order by count desc, latin
) select latin from x where count>1
) select * from y where latin is not null

-- find all names w/o potential pleiades conflicts -> 'names'
with w as (
with y as (
with z as (
select distinct on (lower(quote_transcription),uri) lower(quote_transcription) as name,uri
	from itin_pelagios
)
select s.latin, z.name, z.uri
	from sequence s join z
	on s.latin = z.name
	where s.latin not in (
		with y as (
		with x as (
		select latin, count(*) from sequence group by latin order by count desc, latin
		) select latin from x where count>1
		) select * from y where latin is not null
	)
) select latin, count(*) from y group by latin
) select latin into z_names from w where count = 1
-- select * from z_names -- 258
select distinct(lower(p.quote_transcription)),lower(s.latin) as latin,p.uri
	into z_matches
	from itin_pelagios p join sequence s on p.quote_transcription = s.latin
	where latin in (select latin from z_names)
	order by latin
-- uris into sequence
update sequence s set uri = m.uri, from z_matches m
	where s.latin = m.latin
-- names
update sequence s set names_pl = i.vocab_label from itin_pelagios i
	where s.uri = i.uri
-- output for spreadsheet processing
select * from sequence
-- update sequence.names_pl
update sequence s set names_pleiades = n.names_arr from names_pl n
	where s.uri = n.uri


