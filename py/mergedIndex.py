import glob, os, json, csv, codecs, ast, sys
import index_utils
from index_utils import indexedPlace, matchRecord
from elasticsearch import Elasticsearch

#projects = ['incanto','roundabout']
projects = ['bordeaux','courier','incanto','owtrad','roundabout','vicarello','xuanzang']

def indexPlaces():
    os.chdir("../data/source/")
    #os.chdir("data/source/")
    match_counter = 0
    new_counter = 0
    
    # retrieve all place csv into allPlaces[] json
    allPlaces = []
    for x in range(len(projects)):
        for file in glob.glob('./'+projects[x]+'/places_'+projects[x]+'.csv'):
            with codecs.open(file, 'r', 'utf-8') as f:
                rows = f.readlines()[1:]
                for y in range(len(rows)):
                    row = ast.literal_eval(str(rows[y].split(';')))
                    #print(row)
                    if len(row[7]) > 0:
                        e = ast.literal_eval(row[7])
                        n = ast.literal_eval(row[7])[0]['names']
                        b = []
                        for i in n:
                            b.extend(i.split(', '))
                        e[0]['names'] = list(set(b))
                        e[0]['id'] = row[1]
                        e[0]['title'] = row[2]
                        e[0]['source_gazetteer'] = row[0]
                        row[7] = json.dumps(e)
                        #print(e)
                        allPlaces.append(row)
    
    # make allIndex[]
    allIndex = []
    for x in range(len(allPlaces)):
        matched = {}
        uri = ast.literal_eval(allPlaces[x][7])[0]['uri']
        
        if any(pi for pi in allIndex if pi.is_conflation_of[0]['exact_matches'][0]['uri'] == uri):
            # there's already record in allIndex[] with a matching exact_match uri -> append this one            
            # grab matched record
            matched = next((pi for pi in allIndex if pi.is_conflation_of[0]['exact_matches'][0]['uri'] == uri), None) \
                .is_conflation_of[0]['exact_matches']
            # append a new exact_matches[] element to it
            exact = ast.literal_eval(allPlaces[x][7])[0]
            exact['source_gazetteer'] = allPlaces[x][0]
            exact['title'] = allPlaces[x][4]
            exact['id'] = allPlaces[x][1]
            #print(exact)
            matched.append(exact)
            #print(len(matched), matched[1])
            print('matched exact',exact)
            match_counter += 1
        else:
            # there's no allIndex[] record with matching uri -> new index record
            #print('new record: ' + allPlaces[x][1])
            allIndex.append(indexedPlace(
                allPlaces[x][0], \
                allPlaces[x][1], \
                allPlaces[x][2], \
                allPlaces[x][3], \
                ast.literal_eval(allPlaces[x][7]), \
                float(allPlaces[x][5]), \
                float(allPlaces[x][6])
            ))
            new_counter += 1            
    print('matches: ' + str(match_counter) + '; new: ' + str(new_counter))
    
    def indexEm():
        # delete and rebuild linkedplaces index
        es = Elasticsearch()
        mappings = codecs.open('../elastic/es_mappings.json', 'r', 'utf8').read()
        try:
            es.indices.delete('linkedplaces')
        except:
            pass
        es.indices.create(index='linkedplaces', ignore=400, body=mappings)
        
        # merge names into suggest[] and write out index records
        # TODO: pipe directly into index; writing out is a debug exercise; 
        #fouti = codecs.open('allIndex.json', 'w', 'utf8')    
        fouti = codecs.open('../../_site/data/index/allIndex.json', 'w', 'utf8')  
        for x in range(len(allIndex)):
            #print('len', len(allIndex[x].is_conflation_of))
            allIndex[x].suggest = list(set(allIndex[x].suggest + \
                                           allIndex[x].is_conflation_of[0]['exact_matches'][0]['names']))
            try:
                doc = str(allIndex[x])
                fouti.write(doc + '\n')
            except:
                print('choked on '+str(allIndex[x].id))
        fouti.close()
        
        fini = codecs.open('../../_site/data/index/allIndex.json', 'r', 'utf8')
        #fini = codecs.open('../_site/data/index/allIndex.json', 'r', 'utf8')
        rawi = fini.readlines()
        fini.close()
    
        indexed_count = 0
        error_count = 0
        # index places
        for x in range(len(rawi)):
            doc = json.loads(rawi[x])
            #print(doc['representative_title'],doc['id'])
            try:
                res = es.index(index="linkedplaces", doc_type='place', id=doc['id'], body=doc)
                if res['created']:
                    indexed_count +=1
                #print(res['created'], 'place', doc['id'])
            except:
                print("error:", sys.exc_info()[0])
                error_count +=1
                continue
        print(str(indexed_count)+' places indexed; '+str(error_count)+' missed') 
        
    
    indexEm()
    
    
def indexSegments():
    # SEGMENTS
    idx_count = 0
    error_count = 0
    es = Elasticsearch()
    for y in range(len(projects)):
        fins = codecs.open('../../_site/data/index/'+projects[y]+'_seg.jsonl', 'r', 'utf8')
        raws = fins.readlines()
        fins.close()

        # index segments
        for x in range(len(raws)):
            doc = json.loads(raws[x])
            try:
                res = es.index(index="linkedplaces", doc_type='segment', id=doc['properties']['segment_id'], body=doc)
                idx_count +=1
                #print(res['created'], 'segment', doc['properties']['segment_id'])
            except:
                print("error:",  doc['properties']['segment_id'], sys.exc_info()[0])
                idx_count += 1
    print(str(idx_count)+' segments indexed; '+str(error_count)+' missed')
    
indexPlaces()
indexSegments()