# index-utils.py
# helpers for building index

# i = indexedPlace('owtrad','owt_1022','Frankenau','http://linkedplaces.org/owtrad/places/owt_1022', \
#   [{"uri":"http://sws.geonames/2779383","names":["Frankenau"]}],16.6,47.450001)

class indexedPlace(object):
    def __init__(self, dataset, id, title, uri, exact, lng, lat):
        self.id = "pl."+id
        self.representative_title = title
        self.representative_geometry = [lng,lat]
        self.representative_point = [lng,lat]
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
        self.suggest = [title]

    def __str__(self):
        import json
        #return str(self.__class__) + ": " + str(self.__dict__)    
        return json.dumps(self.__dict__)

    def toJSON(self):
        import json
        return json.dumps(self, default=lambda o: o.__dict__, 
                          sort_keys=True, indent=2)    
    
class matchRecord(object):
    def __init__(self, dataset, id, title, uri, exact):
        self.id = id
        self.title = title
        self.uri = uri
        self.source_gazetteer = dataset
        self.exact_matches = exact
        self.names = [{"name":title,"language": ""}]
        self.temporal_bounds = ["", "", "", "", ""]
    
    def __str__(self):
        import json
        return json.dumps(self.__dict__)    