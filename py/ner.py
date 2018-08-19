import nltk, os, sys, re, datetime, time, codecs
from nltk.tag import StanfordNERTagger
# add the path for the stanford nertagger
stanford_classifier = '/usr/local/StanfordParser/stanford-ner-2017-06-09/classifiers/english.muc.7class.distsim.crf.ser.gz'
stanford_ner_path = '/usr/local/StanfordParser/stanford-ner-2017-06-09/stanford-ner.jar'
st = StanfordNERTagger(stanford_classifier,stanford_ner_path,encoding='utf-8')
#text = """Arthur went to Lake Tahoe, Chukchi Peninsula and then Bogota, but didn't feel very good."""
#tokenize = nltk.word_tokenize(text)
#tuples = st.tag(tokenize)
#print(tuples)

# IN
fin = codecs.open('../data/explorations/aoe_all.txt', 'r', 'utf8') 
raw = fin.readlines()
fin.close()
# OUT
fout = codecs.open('../data/explorations/aoe_parsed.txt', 'w', 'utf8')
    
r1 = re.compile('^(.*?)\t') # time
r2 = re.compile('\^(.*?)\^') # person
r3 = re.compile('\t(.*?)$') # sentence

for x in range(len(raw)):
    row = raw[x][:-1] #; print(row)
    clean = row.replace('^','')
    if bool(re.search(r1,row)):
        time = re.search(r1,row).group(1)
    else:
        time = ''
    if bool(re.search(r2,row)):
        persons = re.findall(r2,row)
    else:
        persons = []
    sentence = re.search(r3,clean).group(1)
    
    tokenize = nltk.word_tokenize(sentence)
    tuples = st.tag(tokenize)    
    tag = 'LOCATION'
    previous = next_ = None
    l = len(tuples)
    places = []

    for index, tup in enumerate(tuples):
        #print(term,tag)
        if tup[1] == tag:
            if index > 0:
                previous = tuples[index - 1]; #print('prev',previous)
                next_ = tuples[index + 1]
                if tup[1] == previous[1]:
                    places.append(previous[0] + ' '+ tup[0])
                elif tup[1] != next_[1]:
                    places.append(tup[0])
    
    fout.write(time + '\t' + str(persons) + '\t' + str(places) + '\t' + sentence + '\n')
    
fout.close()

#print(places)
        #if index < (l - 1):
            #next_ = tuples[index + 1]