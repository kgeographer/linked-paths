# geonames-align.py
# get GeoNames country codes; then get geonames_id for given toponym/countryCode

import os, sys, csv, json, codecs, re, copy, urllib.request
from decimal import Decimal
from urllib.parse import quote

dir = os.getcwd() + '/data/'
def init():
    #dir = os.getcwd() + '/data/'
    #os.chdir('./py')
    global proj, reader_p, reader_s, finp, fins, fout, foutp, fouts, collection, collectionAttributes, routeidx, myrow
    # owtrad, courier, incanto-f, incanto-j, roundabout, vicarello, xuanzang, bordeaux
    #mtrow={}
    proj = 'xuanzang'

    finp = codecs.open('../data/source/'+proj+'/places_'+proj+'.csv', 'r', 'utf8')

    # output alignment result
    foutp = codecs.open('../data/source/'+proj+'/geonames-align.csv', 'w', 'utf8')
    foutp.write('place_id;lp_label;cntry;gnid;gn_name\n')

    reader_p = csv.DictReader(filter(lambda row: row[0]!='#', finp), delimiter=';')

    # required fields
    req_p = ['collection', 'place_id','toponym','gazetteer_uri','gazetteer_label','lng','lat','exact_matches','close_matches']

    if not reader_p.fieldnames[:9] == req_p:
        sys.exit('core place field names incorrect. You have: \n' + str(reader_p.fieldnames))

    print('Project: ' + proj)

#'http://api.geonames.org/searchJSON?q=Zara&'+bbox(row['lat'],row['lng'])+'&maxRows=10&username=satchinsb'
#44.121441&lng=15.217873

def bbox(lat,lng):
    # south=43.62&north=44.521&west=14.717&east=15.717
    #print(lat,lng)
    south = Decimal(lat) - Decimal(0.5)
    north = Decimal(lat) + Decimal(0.5)
    west = Decimal(lng) - Decimal(0.5)
    east = Decimal(lng) + Decimal(0.5)
    string = 'south='+str(south)+'&north='+str(north)+'&west='+str(west)+'&east='+str(east)
    #string = 'south='+str(lat)+'&north='+str(lat)+'&west='+str(lng)+'&east='+str(lng)
    return string

def gnLookup():
    #finp.seek(0) # resets dict.reader
    myrow={}
    for idx, row in enumerate(reader_p):
        requrl = 'http://api.geonames.org/searchJSON?name='+quote(row['gazetteer_label'])+'&fclass=P&'+ \
            bbox(row['lat'],row['lng'])+'&maxRows=3&username=satchinsb'
        print(requrl)
        with urllib.request.urlopen(requrl) as url:
            try:
                data = json.loads(url.read().decode('utf-8'))
                #data = json.loads(url.read())
                foutp.write(row['place_id']+';'+row['gazetteer_label']+';'+data['geonames'][0]['countryCode']+ \
                        ';'+str(data['geonames'][0]['geonameId']) +
                        ';'+data['geonames'][0]['toponymName'] +'\n')
            except:
                print('exception, continuing')
                continue
    foutp.close()

init()
gnLookup()
