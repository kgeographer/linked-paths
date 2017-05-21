import glob, os, json, csv, codecs, ast, sys
from elasticsearch import Elasticsearch

def init():
    # delete and rebuild linkedplaces index
    es = Elasticsearch()
    mappings = codecs.open('es_mappings.json', 'r', 'utf8').read()
    try:
        es.indices.delete('linkedplaces')
    except:
        pass
    es.indices.create(index='linkedplaces', ignore=400, body=mappings)    


def indexPlaces():
    fini = codecs.open('../public_html/data/index/allIndex.json', 'r', 'utf8')
    rawi = fini.readlines()
    fini.close()

    indexed_count = 0
    error_count = 0
    # index places
    for x in range(len(rawi)):
        doc = json.loads(rawi[x])
        print(doc['representative_title'])
        try:
            res = es.index(index="linkedplaces", doc_type='place', id=doc['id'], body=doc)
            if res['created']:
                indexed_count +=1
            #print(res['created'], 'place', doc['id'])
        except:
            print("error:", sys.exc_info()[0])
            error_count +=1
            continue
    print(str(indexed_count)+' indexed; '+str(error_count)+' missed')     
    
def indexSegments():
    # SEGMENTS
    es = Elasticsearch()
    for y in range(len(datasets)):
        #print(datasets[y])
        #print(os.getcwd())
        fins = codecs.open('../public_html/data/index/'+datasets[y]+'_seg.jsonl', 'r', 'utf8')
        raws = fins.readlines()
        fins.close()

        # index segments
        for x in range(len(raws)):
            doc = json.loads(raws[x])
            try:
                res = es.index(index="linkedplaces", doc_type='segment', id=doc['properties']['segment_id'], body=doc)
                print(res['created'], 'segment', doc['properties']['segment_id'])
            except:
                print("error:",  doc['properties']['segment_id'], sys.exc_info()[0])
    
#init()
#indexPlaces()
#indexSegments()