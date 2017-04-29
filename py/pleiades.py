
import os, sys, json, codecs, re
#import urllib2
import urllib.request

wd = '/Users/karlg/Documents/Repos/linked-places'
fout = codecs.open(wd+'/data/pleiades-names-vicarello.csv', 'w', 'utf8')
fout.write('uri\ttitle\tnames\n')
idlist = codecs.open(wd+'/data/plidlist-vicarello.csv','r', 'utf8').readlines()

for x in range(len(idlist)):
#for x in range(1):
    url = idlist[x][:-1]+'/json'
    req = urllib.request.Request(url)
    namelist = []
    try:
        with urllib.request.urlopen(req) as response:
            record = json.loads(response.readall().decode('utf-8'))
            names = record['names']
            title = record['title']
            print(title)
            for x in range(len(names)):
                namelist.append(names[x]['romanized'])
        fout.write(url[:-5]+'\t'+title+'\t'+str(namelist)+'\n')
    except:
        print('exception, continuing')
        continue

fout.close()
