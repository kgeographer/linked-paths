# unifiedIndex
# rev. 1 May 2017; @kgeographer
# read folder of gazetteer files, perform conflation; write json-l file for index

finp.seek(0) # resets dict.reader
next(reader_p, None) # skip header
for row in reader_p:
    # TODO find close and exact matches somehow
    exactMatches = ast.literal_eval(row['exact_matches']) if row['exact_matches'] != '' else []
    place = {
        "id": "owt_1022", 
        "representative_title": "Frankenau", 
        "representative_geometry": [], 
        "temporal_bounds_union": ["", "", "", "", ""], 
        "is_conflation_of": [
            {"id": "owt_1022", 
             "title": "Frankenau", 
             "uri": "http://linkedplaces.org/owtrad/places/owt_1022", 
             "source_gazetteer": "owtrad", 
             "names": [{"name": "Frankenau", "language": ""}], 
             "exact_matches": [{"uri":"http://sws.geonames/2779383","names":["Frankenau"]}], 
             "close_matches": [], 
             "descriptions": [{"description": "", "language": ""}], 
             "place_types": [],
             "temporal_bounds": ["", "", "", "", ""]
            }
        ], 
        "suggest": ["Frankenau"]
    }
    for x in range(len(exactMatches)):
        foo = exactMatches[x]
        print(foo, type(foo))
        place['is_conflation_of'][0]['exact_matches'].append(foo)

    #TODO: build a better parseNames to populate "suggest":[]

    places.append(place)
    #print(json.dumps(place))

# JSONlines for index
# NOTE: demo place index records have been manually edited , do not regenerate
for x in range(len(places)):
    foutp.write(json.dumps(places[x]) + '\n')
foutp.close()
# owtrad;owt_1022;Frankenau;http://linkedplaces.org/owtrad/places/owt_1022;Frankenau;16.6;47.450001;
#[{"uri":"http://sws.geonames/2779383","names":["Frankenau"]}];;
#[{"id" : 4735, "variant" : "Frankenau", "source" : "ADL", "precision" : "exact", "identity" : "exact"}];{Frankenau}
#bordeaux;bor_179;paramuole;http://linkedplaces.org/places/bor_179;Paramuole;25.047069;42.198004;
#[{"uri":"http://pleiades.stoa.org/places/216920","names":['Parambole']}];
class indexedPlace(object):
    def __init__(self, dataset, id, title, uri, exact, lng, lat):
        self.id = "pl."+id
        self.representative_title = title
        self.representative_geometry = [lng,lat]
        self.temporal_bounds_union = []
        self.is_conflation_of = [{ \
            "id": id,
            "title": title,
            "uri": uri,
            "source_gazetteer": dataset,
            "names": [{"name":title,"language": ""}],
            "exact_matches": exact,
            "close_matches": [],
            "descriptions": [{"description": "", "language": ""}], 
            "place_types": [],
            "temporal_bounds": ["", "", "", "", ""]
        }]
        self.suggest = []

    def addProperty(self,key):
        self.properties[key] = properties[key]
# i = indexedPlace('owtrad','owt_1022','Frankenau','http://linkedplaces.org/owtrad/places/owt_1022',[{"uri":"http://sws.geonames/2779383","names":["Frankenau"]}],16.6,47.450001)
    
class matchRecord(object):
    def __init__(self, dataset, id, title, uri, exact):
        self.id = id
        self.title = title
        self.uri = uri
        self.source_gazetteer = dataset
        self.exact_matches = exact
        self.names = [{"name":title,"language": ""}]
        self.temporal_bounds = ["", "", "", "", ""]        
        
#place = {
    #"id": "lp.owt_1022", 
    #"representative_title": "Frankenau", 
    #"representative_geometry": [], 
    #"temporal_bounds_union": ["", "", "", "", ""], 
    #"is_conflation_of": [
        #{"id": "owt_1022", 
         #"title": "Frankenau", 
         #"uri": "http://linkedplaces.org/owtrad/places/owt_1022", 
         #"source_gazetteer": "owtrad", 
         #"names": [{"name": "Frankenau", "language": ""}], 
         #"exact_matches": [{"uri":"http://sws.geonames/2779383","names":["Frankenau"]}], 
         #"close_matches": [], 
         #"descriptions": [{"description": "", "language": ""}], 
         #"place_types": [],
         #"temporal_bounds": ["", "", "", "", ""]
        #}
    #], 
    #"suggest": ["Frankenau"]
    #}