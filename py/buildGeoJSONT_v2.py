# buildGeoJSONT_v2.py
# read places and segments csv, output GeoJSON-T for Linked Places application
# index schema changed; exact_matches, close_matches
# rev 2017-04-29 k. grossner

import os, sys, csv, json, codecs, re, copy, ast
# TODO should we de-duplicate?
# TODO options: separate files for QGIS work; generate edges (here or in js?)
dir = os.getcwd() + '/data/'
def init():
    #dir = os.getcwd() + '/data/'
    #os.chdir('./py')
    global proj, reader_p, reader_s, finp, fins, fout, foutp, fouts, collection, collectionAttributes, routeidx, exactMatches
    # owtrad, courier, incanto-j, roundabout, vicarello, xuanzang, bordeaux 
    # (incanto-f abandoned for now, flows computed from journeys)
    proj = 'owtrad'
    data = 'owtrad'

    finp = codecs.open('../data/source/'+proj+'/places_'+proj+'.csv', 'r', 'utf8')
    fins = codecs.open('../data/source/'+proj+'/segments_'+data+'.csv', 'r', 'utf8')
    fout = codecs.open('../_site/data/'+proj+'.geojson', 'w', 'utf8')

    # NOTE: demo uses manually edited place records
    # output places for index
    foutp = codecs.open('../_site/data/index/'+proj+'.jsonl', 'w', 'utf8')

    # output segments for index
    fouts = codecs.open('../_site/data/index/'+data+'_seg.jsonl', 'w', 'utf8')

    # TODO: option for separate places and segments files

    reader_p = csv.DictReader(filter(lambda row: row[0]!='#', finp), delimiter=';')
    reader_s = csv.DictReader(filter(lambda row: row[0]!='#', fins), delimiter=';')

    # required fields
    req_p = ['collection','place_id','toponym','gazetteer_uri','gazetteer_label','lng','lat','exact_matches','close_matches']
    req_s = ['collection', 'route_id', 'segment_id', 'source', 'target', 'label', 'geometry', \
                                           'timespan', 'duration','follows']

    # get FeatureCollection properties from segments file header
    # NOTE: GeoJSON specs disallow 'properties' members outside of Features
    # but allow 'foreign members' anywhere, so call them 'attributes'
    
    reader_attr = csv.reader(filter(lambda row: row[0]=='#', fins), delimiter=';')
    collectionAttributes = {}

    #fins.seek(0)
    for row in reader_attr:
        field = re.match(r'#(.*?):(.*)', row[0]).group(1).lstrip()
        value = re.match(r'#(.*?):(.*$)', row[0]).group(2).lstrip()
        collectionAttributes[field] = value

    collection = {
        "type":"FeatureCollection",
        "attributes": collectionAttributes,
        # NOTE: next line used for courier, the only one with a "periods" object now
        #"when": {"timespan": collectionAttributes['timespan'][1:-1].split(','), "periods": collectionAttributes['periods']},
        "when": {"timespan": collectionAttributes['timespan'][1:-1].split(',')},
        "features": []
        }

    if not reader_p.fieldnames[:9] == req_p:
        sys.exit('core place field names incorrect. You have: \n' + str(reader_p.fieldnames))

    # TODO test segments columns, offer options
    fins.seek(0)
    if not reader_s.fieldnames[:10] == req_s:
        sys.exit('core segment field names incorrect. You have: \n' + str(reader_s.fieldnames))
        sys.exit('core segment field names incorrect.')

    print('Project: ' + proj + ', Data: ' + data)


def createPlaces():

    places = []

    def toPoint(row):
        #print(row['lng'])
        return {
            'type': 'Point',
            'coordinates': [ float(row['lng']), float(row['lat']) ]
            #'coordinates': [ row['lng'], row['lat'] ]
        }
    def parseNames(row):
        arr = row['gazetteer_label'].split('/') if row['gazetteer_label'] != '' else []
        arr.append(row['toponym'])
        # TODO: de-duplicate
        return arr
           
    for idx, row in enumerate(reader_p):
        #print(row['exact_matches'])
        exactMatches = ast.literal_eval(row['exact_matches']) if row['exact_matches'] != '' else []
        print(exactMatches,type(exactMatches))
        feat = {"type":"Feature", \
                "id": row['place_id'], \
                "label": row['toponym'], \
                "geometry":toPoint(row), \
                "properties": { \
                    "collection": row['collection'], \
                    "toponym": row['toponym'], \
                    "gazetteer_uri": row['gazetteer_uri'], \
                    "gazetteer_label": row['gazetteer_label'], \
                    "exact_matches": exactMatches
                }
        }

        # remaining properties (columns after 10th)
        props = reader_p.fieldnames[9:]

        for x in range(len(props)):
            feat['properties'][props[x]] = row[props[x]]
        #if row['lng'] != null:
        collection['features'].append(feat)
        print(str(len(collection['features'])) + ' place features')


def createSegments():

    counter = 0
    routeidx = 0

    def yearToSpan(yr):
        #year = '[' + yr + '-01-01,,,' + yr + '-12-31,]' if yr else ''
        year = yr + '-01-01,,,' + yr + '-12-31,' if yr else ''
        return year.split(',')
    def makeLine(row):
        d = collection['features']
        coords = []
        try:
            p1 = next((x['geometry']['coordinates'] for x in d if x['id'] == row['source']), None)
            coords.append(p1)
        except:
            sys.exit('source id ' + p1 + ' not found')
        try:
            p2 = next((x['geometry']['coordinates'] for x in d if x['id'] == row['target']), None)
            coords.append(p2)
        except:
            sys.exit('target id ' + p1 + ' not found')
        return coords

    def toGeometry(row):
        # geometry within GeometryCollection, with when and n properties

        if row['geometry'] == '':
            # no geometry given, left to JavaScript
            g = {
            "type":"LineString",
            "coordinates":  makeLine(row)
            }
        elif row['geometry'][0] == '{':
            # geometry is a GeoJSON object, start with that
            g = json.loads(row['geometry'])

        elif type(json.loads(row['geometry'])) == list:
            # geometry is coordinates only
            g = {
            "type":"LineString",
            "coordinates":  json.loads(row['geometry'])
            }

        # build when object
        g['when'] = {"timespan": yearToSpan(row['timespan']) if 0 <= len(row['timespan']) <= 5 else \
                                            row['timespan'].split(','),
                     "duration": row['duration'],
                     "follows": row['follows'] if 'follows' in reader_s.fieldnames else 'n/a'}

        #print(g['when'])
        # core properties
        g['properties'] = {
            "segment_id": (row['segment_id'] if 'segment_id' in reader_s.fieldnames else '') ,
            "collection": row['collection'],
            "route_id": row['route_id'],
            "label": row['label'],
            "source": row['source'],
            "target": row['target']
        }

        props = reader_s.fieldnames[8:]
        #print(props)
        for x in range(len(props)):
            #print(props[x])
            g['properties'][props[x]] = row[props[x]]

        return g
    # end toGeometry(row)

    for idx, row in enumerate(reader_s):
        #print(row)
        segment = toGeometry(row)
        #print('route_id is ' + row['route_id'])
        if row['route_id'] != routeidx:
            # first row for a route
            feat = {"type":"Feature",
                    "geometry": {"type":"GeometryCollection",
                                 "geometries": [segment]
                                 },
                    "when": {},
                    "properties": {
                        "collection": row['collection'],
                        "route_id": row['route_id']
                    }
                }
            routeidx = row['route_id']
            collection['features'].append(feat)
            counter += 1

        else:
            # add geometry + properties for each segment within a route
            feat['geometry']['geometries'].append(segment)
            counter += 1

        # output modified segment as JSONline for index
        leanSegment = copy.deepcopy(segment)
        leanSegment['geometry'] = {"type":segment['type'], "coordinates":segment['coordinates']}
        del leanSegment['coordinates']
        del leanSegment['type']
        leanSegment['type'] = "Feature"
        fouts.write(json.dumps(leanSegment) + '\n')

    print(str(counter) + ' segments generated')

    fout.write(json.dumps(collection,indent=2))
    fout.close()
    fouts.close()


init()
createPlaces()
createSegments()

#fout.write(json.dumps(collection,indent=2))
#fout.close()
