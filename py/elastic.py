# elastic.py
# manage Elasticsearch index for Linked Places

import os, sys, re, codecs, json
from datetime import datetime
from elasticsearch import Elasticsearch

es = Elasticsearch()

# delete and rebuild linkedplaces index
mappings = codecs.open('../data/elastic/es_mappings.json', 'r', 'utf8').read()
es.indices.delete('linkedplaces')
es.indices.create(index='linkedplaces', ignore=400, body=mappings)


# some projects have multiple sets of segments; e.g. incanto
# project places need to be indexed only once
projects = ["incanto", "vicarello", "courier", "xuanzang", "roundabout","owtrad","bordeaux"]
datasets = ["incanto-f", "incanto-j", "vicarello", "courier", "xuanzang", "roundabout","owtrad","bordeaux"]

def indexSegments():
    # SEGMENTS
    for y in range(len(datasets)):
        #print(datasets[y])
        print(os.getcwd())
        fins = codecs.open('../_site/data/index/'+datasets[y]+'_seg.jsonl', 'r', 'utf8')
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

def indexPlaces():
    # PLACES
    for y in range(len(projects)):
        print(projects[y])
        # NOTE: place index for demo site uses manually edited jsonl files in (...)data/demo
        #finp = codecs.open('../_site/data/index/'+projects[y]+'.jsonl', 'r', 'utf8')
        finp = codecs.open('../data/source/allIndex.json', 'r', 'utf8')
        rawp = finp.readlines()
        finp.close()

        # index places
        for x in range(len(rawp)):
            doc = json.loads(rawp[x])
            try:
                res = es.index(index="linkedplaces", doc_type='place', id=doc['id'], body=doc)
                print(res['created'], 'place', doc['id'])
            except:
                print("error:", sys.exc_info()[0])




#indexPlaces()
#indexSegments()
