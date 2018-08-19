require('handlebars')
window.segments = []

var elasticsearch = require('elasticsearch');
window.esclient = new elasticsearch.Client({
  host: 'localhost:9200',
  // log: 'trace'
});

var years = function(timespan){
  //return start and end from topotime when timespan
  // console.log('years() timespan',timespan)
  var str = '';
  if(timespan.length > 1) {
    str = timespan[0].substring(0,4)+'-'+timespan[2].substring(0,4);
    //TODO: make timespans in json-l index files consistent length
    // str = timespan[0].substring(0,4)+'-'+timespan[3].substring(0,4);
  } else {
    str = timespan[0]
  }
  return str;
}

window.segmentSearch = function(obj){
  console.log('segmentSearch obj', obj)
  //from popup: segmentSearch obj Object {ra0033: Array(3)}
  //from search: segmentSearch obj Object {in_60056: Array(2)}
  ga('send', 'event', ['Search'], ['Select'], ['Search panel']);
  // retrieve all segments associated with a place,
  // populate results_inset
  let html = ''
  var plKeys = Object.keys(obj)
  window.relevantProjects = []
  for(let i = 0; i < plKeys.length; i++){
    // console.log('plKeys[i]', obj[plKeys[i]])
    for(let j=0;j<obj[plKeys[i]].length;j++) {
      // console.log('j in i',obj[plKeys[i]][j])
      relevantProjects.push(obj[plKeys[i]][j][0])
      // multi_match an id in segment sources and targets
      var searchParams = {
        index: 'linkedplaces',
        type: 'segment',
        body: {
          query: {
            multi_match : {
                query : obj[plKeys[i]][j][2],
                fields: ["properties.source","properties.target"]
            }
          }
        }
      }

      // perform search
      esclient.search(searchParams).then(function (resp) {
        return Promise.all(resp.hits.hits)
      }).then(function(hitsArray){
          // console.log('hitsArray', hitsArray)
          html += '<div class="place-card">'+
            // '<p class="search-result-project">from: <em>'+obj[plKeys[i]][j][0]+'</em></p>'+
            '<h4><a href="#" project="'+obj[plKeys[i]][j][0]+
            '" id="'+obj[plKeys[i]][j][2]+'">'+obj[plKeys[i]][j][0]+
            '</a> connections:</h4><ul class="ul-segments">';
          for(let j = 0; j < hitsArray.length; j++){
            let l = hitsArray[j]._source.properties.label
            html += '<li>'+(l==''?'<em>no label</em>':l)+' ('+
            years(hitsArray[j]._source.when.timespan)+
            ')</li>';
          };
          html += '</ul></div>'
          $("#results_inset").html(html)
          $(".place-card a").click(function(e){
            ga('send', 'event', ['Search'], ['Choose dataset'], ['Search panel']);
            window.proj = $(this).attr('project')
            // console.log('project',proj)
            // if project/dataset isn't loaded, load it (project !- dataset for incanto)
            window.pcheck = $("input:checkbox[value='"+proj+"']")
            // console.log('toponym checked',pcheck,proj)
            if(pcheck.prop('checked') == false){
              // loadLayer(proj,idToFeature[proj].places[this.id])
              location.href = location.origin+location.pathname+'?d='+proj+'&p='+this.id
              pcheck.prop('checked', true)
            } else {
              // console.log(proj,'already loaded, zoom to',this.id)
            }
          })
        }).catch(console.log.bind(console));
    }
  }
}

// resolve collection names as they exist in data
var collections = {
  "roundabout":"roundabout","courier":"courier","incanto":"incanto",
  "vicarello":"vicarello","xuanzang":"xuanzang","owtrad":"owtrad","bordeaux":"bordeaux"}

var toponyms = new Bloodhound({
  datumTokenizer: function(datum) {
    return Bloodhound.tokenizers.whitespace(datum.value);
  },
  queryTokenizer: Bloodhound.tokenizers.whitespace,
  remote: {
    wildcard: encodeURIComponent('%QUERY'),
    url: 'http://localhost:9200/linkedplaces/_suggest?source=' +
        '{"q":{"prefix":"%QUERY","completion":{"field":"suggest"}}}',
        // encodeURIComponent('{"q":{"prefix":"%QUERY","completion":{"field":"suggest"}}}'),
    prepare: function (query, settings) {
      settings.type = "POST";
      settings.contentType = "application/json; charset=UTF-8";
      console.log(settings)
      return settings;
    },
    transform: function(response) {
      return $.map(response.q[0].options, function(place) {
        return {
          id: place._source.id,
          data: place._source.is_conflation_of,
          value: place._source.representative_title,
          names: place._source.suggest
        };
      });
    }
  }
});
//
var template = Handlebars.compile($("#place-template").html());

$('#bloodhound .typeahead').typeahead({
  hint: true,
  highlight: true,
  minLength: 3
  },
  {
  name: 'places',
  limit: 10,
  display: 'value',
  source: toponyms,
  templates: {
    empty: [
      '<div class="empty-message">',
        'no matches',
      '</div>'
      ].join('\n'),
    suggestion: template
  }
});

$(".typeahead").on("typeahead:select", function(e,obj){
  console.log('event listener')
  //console .log('typeahead obj',obj)
  var placeArr = [];
  var placeObj = {};
  for(let i=0;i<obj.data.length;i++){
    let payload = obj.data[i]
    let project = payload.source_gazetteer;
    // gather place_ids from 'conflation_of' records
    placeObj[payload.id] = [[project, payload.title, payload.id]];
    for(let j=1;j<payload['exact_matches'].length;j++){
      placeObj[payload.id].push(
        [payload['exact_matches'][j].source_gazetteer,
        payload['exact_matches'][j].title,
        payload['exact_matches'][j].id]
      )
    }
  }
  //
  // get segments and display in #results_inset
  segmentSearch(placeObj);

  $(".typeahead.tt-input")[0].value = '';
  //
})
