import glob, os, json, csv, codecs, ast

os.chdir("data/source/")
#projects = ['bordeaux','courier','incanto','owtrad','roundabout','vicarello','xuanzang']
#projects = ['owtrad']
projects = ['bordeaux', 'vicarello']
#foutp = codecs.open('../allPlaces.json', 'w', 'utf8')
#fouti = codecs.open('../allIndex.json', 'w', 'utf8')
foutp = codecs.open('allPlaces.json', 'w', 'utf8')
fouti = codecs.open('allIndex.json', 'w', 'utf8')

# retrieve all places into allPlaces[]
allPlaces = []
for x in range(len(projects)):
    for file in glob.glob('./'+projects[x]+'/places_'+projects[x]+'.csv'):
        with codecs.open(file, 'r', 'utf-8') as f:
            rows = f.readlines()[1:]
            for y in range(len(rows)):
                row = ast.literal_eval(str(rows[y].split(';')))
                print(row)
                if len(row[7]) > 0:
                    allPlaces.append(row)

# make allIndex[]
allIndex = []
#for x in range(100):
#for x in range(len(allPlaces)):
for x in range(1):
    matched = {}
    uri = ast.literal_eval(allPlaces[x][7])[0]['uri']
    print(uri)
    
    if any(pi for pi in allIndex if pi.is_conflation_of[0]['exact_matches'][0]['uri'] == uri):
        # there's already record in allIndex[] with a matching exact_match uri -> append this one
        
        # grab matched record
        matched = next((pi for pi in allIndex if pi.is_conflation_of[0]['exact_matches'][0]['uri'] == uri), None) \
            .is_conflation_of[0]['exact_matches']
        print(matched)
        
        # append a new exact_matches[] element to it
        #  def __init__(self, dataset, id, title, uri, exact)       
        matched.append(matchRecord( \
            allPlaces[x][0], \
            allPlaces[x][1], \
            allPlaces[x][2], \
            allPlaces[x][3], \
            ast.literal_eval(allPlaces[x][7])[0]
         ))
        #print(allIndex[0])
    else:
        # there's no allIndex[] record with matching uri -> new index record
        #  def __init__(self, dataset, id, title, uri, exact, lng, lat):
        #allIndex.append(indexedPlace('owtrad','owt_1022','Frankenau', \
                                     #'http://linkedplaces.org/owtrad/places/owt_1022', \
                                     #[{"uri":"http://sws.geonames/2779383","names":["Frankenau"]}],16.6,47.450001))
        allIndex.append(
            allPlaces[x][0], \
            allPlaces[x][1], \
            allPlaces[x][2], \
            allPlaces[x][3], \
            ast.literal_eval(allPlaces[x][7])[0], \
            allPlaces[x][5], \
            allPlaces[x][6]
        )

        # owtrad;owt_1022;Frankenau;http://linkedplaces.org/owtrad/places/owt_1022;Frankenau;16.6;47.450001;
        #[{"uri":"http://sws.geonames/2779383","names":["Frankenau"]}];;
        #[{"id" : 4735, "variant" : "Frankenau", "source" : "ADL", "precision" : "exact", "identity" : "exact"}];{Frankenau}
        
for x in range(len(allIndex)):
    fouti.write(json.dumps(allIndex[x]) + '\n')
fouti.close()

for x in range(len(allPlaces)):
    foutp.write(json.dumps(allPlaces[x]) +'\n')
foutp.close()
#print(allIndex[0])
#print(allIndex[1])


#allIndex= [
    #{"id":"p123","exact":[{"uri":"http://gaz1/ur123","title":"Place1"}]},
    #{"id":"p234","exact":[{"uri":"http://gaz2/ur234","title":"Place2"}]}
#]

#allPlaces = [ 
    #{"id":"p456","exact":[{"uri":"http://gaz1/ur123","title":"Place1Variant"}]},
    #{"id":"p345","exact":[{"uri":"http://gaz2/ur234","title":"Place2Variant"}]}
#]


#{
    #"id": "owt_1022", 
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
