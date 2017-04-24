
import os, sys, json, codecs, re
#import urllib2
import urllib.request

#url='https://pleiades.stoa.org/places/'
#json.load(urllib2.urlopen(url))

#reader_plid = csv.DictReader(filter(lambda row: row[0]!='#', idlist), delimiter=';')
wd = '/Users/karlg/Documents/Repos/linked-places'
fout = codecs.open(wd+'/data/pleiades-names.csv', 'w', 'utf8')
idlist = codecs.open(wd+'/data/source/bordeaux/plidlist.csv','r', 'utf8').readlines()

for x in range(len(idlist)):
    url = idlist[x][:-1]+'/json'
    req = urllib.request.Request(url)
    namelist = []
    fout.write('title\turi\tnames')
    with urllib.request.urlopen(req) as response:
        record = json.loads(response.readall().decode('utf-8'))
        names = record['names']
        title = record['title']
        for x in range(len(names)):
            namelist.append(names[x]['romanized'])
    fout.write(title+'\t'+url[:-5]+'\t'+str(namelist)+'\n')

fout.close()
