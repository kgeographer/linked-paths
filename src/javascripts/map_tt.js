var url = require('url'),
    querystring = require('querystring'),
    moment = require('moment'),
    _ = require('underscore')
window._ = _
    // , d3 = require('d3')
// require('bootstrap')
require('mapbox.js')
var turf = require('turf')

moment().format();
// import add'l app JavaScript
import './bloodhound.js';
// require('@turf/centroid')
// require('@turf/buffer')

// exposed for debugging
window.parsedUrl = url.parse(window.location.href, true, true);
window.searchParams = querystring.parse(parsedUrl.search.substring(1));
window.features = {};
window.d3graph = {"nodes":[], "links":[]}
window.idToFeature = {};
// TODO; simile doesn't handle BCE well
// window.eventsObj = {'dateTimeFormat': 'Gregorian','events':[ ]};
window.eventsObj = {'dateTimeFormat': 'iso8601','events':[ ]};
window.myLayer = {};
window.pointFeatures = [];
window.lineFeatures = [];
window.bboxFeatures = [];
window.tl = {};
window.tlMidpoint = '';
window.dataRows = '';
window.timelineCounter = 0;
window.grain = 'date' // timeline data grain for snapping

// on start
$(function() {
  // TODO: restore state in href approach (?)
  Object.getOwnPropertyNames(searchParams).length == 0 ?
    startMapM() : startMapM(searchParams['d'],searchParams['p'])
  $("#menu").click(function(){
    $("#data").toggle("fast")
  })
  $(".data-header").html(searchParams['d'])
  $("input:checkbox").change(function(){
    if(this.checked == true) {
      if(searchParams['p'] == undefined) {
        ga('send', 'event', ['Layers'], ['Check'], ['Data panel']);
        $(".loader").show()
        loadLayer(this.value)
      } else {
        location.href = location.origin+location.pathname+'?d='+this.value;
      }
    } else {
      // one set of events at a time right now
      if(typeof eventSrc != "undefined"){
        eventSrc.clear()
      }
      zapLayer(this.value)
    }
  })
  $("#tabs").tabs()
  $('[data-toggle="popover"]').popover();
  $('.panel-title i').click(function(){
    window.open('http://kgeographer.com/?p=140&preview=true', '', 'width=700');
  })
});

// position timeline
window.midpoint = function(ts,type) {
  // console.log('midpoint ts',ts)
  if(type == 'start') {
    var mid = new Date(ts[0])
  } else if(type == 'mid') {
    let start = new Date(ts[0])
    let end = ts[3] == ('' || undefined) ? new Date(Date.now()) : new Date(ts[3])
    var mid = new Date((start.getTime() + end.getTime()) / 2);
  }
  // console.log(mid)
  return mid
}

var resizeTimerID = null;

function onResize() {
    if (resizeTimerID == null) {
        resizeTimerID = window.setTimeout(function() {
            resizeTimerID = null;
            tl.layout();
        }, 500);
    }
}

window.fixDate = function(d){
  let foo = moment(d).toISOString()
  return foo;
}

function parseWhen(when) {
  console.log(when.timespan[0])
  let html = "<div class='segment-when'>";
  html+="start: "+when.timespan[0]+"-"+when.timespan[1]+"<br/>"+
        "end: "+when.timespan[2]+"-"+when.timespan[3]+"<br/>"+
        "duration: "+when.duration==""?"throughout":when.duration+"</div>"
  return html;
}

// events for Journey data
function buildSegmentEvent(feat){
  // need validate function here
  // if(validateWhen(place)==true {})
  var event = {};
  event['id'] = feat.properties.segment_id;
  event['title'] = feat.properties.label;
  event['description'] = !feat.properties.description ? "" : feat.properties.description;
  // assuming valid; we know it's there in toy example
  event['start'] = feat.when.timespan[0];
  event['latestStart'] = feat.when.timespan[1] == "" ? "" :feat.when.timespan[1];
  event['earliestEnd'] = feat.when.timespan[2] == "" ? "" :feat.when.timespan[2];
  event['end'] = feat.when.timespan[3] == "" ? "" :feat.when.timespan[3];
  event['duration'] = feat.when.duration;
  // event['durationEvent'] = "true";
  event['link'] = "";
  event['image'] = "";
  // console.log('built ', event)
  return event;
}

// Flows and hPeriod data get a single period band
function buildCollectionPeriod(coll){
  console.log(' in buildCollectionPeriod()',coll.when.timespan)
  window.ts = coll.when.timespan
  var event = {};
  event['id'] = '{event id}';
  event['title'] = 'valid period, '+coll.attributes.title;
  event['description'] = ts[4];
  event['start'] = ts[0];
  event['latestStart'] = ts[1] == "" ? "" :ts[1];
  event['earliestEnd'] = ts[2] == "" ? "" :ts[2];
  event['end'] = ts[3] == "" ? "" :ts[3];
  event['durationEvent'] = "true";
  event['link'] = "";
  // event['link'] = coll.attributes.uri;
  event['image'] = "";
  // console.log('event', JSON.stringify(event))
  tlMidpoint = midpoint(ts,'start')
  return event;
}

var mapStyles = {
  segments: {
    color: "#993333",
    // color: "#993333",
    weight: 2,
    opacity: 0.6,
    highlight: {
      color: "yellow",
      weight: 4
    }
  },
  bbox: {
    color: 'orange',
    fillColor: '#eeeee0',
    fillOpacity: 0.6,
    weight: 1
  }
}

function stylePoints(feature) {
  let fill=colorMap[feature.toGeoJSON().properties.collection]
  let rad=feature.toGeoJSON().properties.collection=='owtrad'?2:4;
  // console.log(coll)
	return {
      color: '#000',
      fillColor: fill,
      radius: rad,
      fillOpacity: 0.6,
      weight: 1
    };
}

function stylePaths(feature,range) {
  let when = new Date(feature.when.timespan[0])
  let pathDateScale = d3.scaleTime()
    .domain([range[0], range[1]])
    .range(["#ff6666","#990000"]);
  let pathSequenceScale = d3.scaleTime()
    .domain([range[0], range[1]])
    .range(["#ff6666","#990000"]);
  // console.log('when, range',when,range)
  return {
    // color: "#993333",
    color: pathDateScale(when),
    weight: 2,
    opacity: 0.6,
    highlight: {
      color: "yellow",
      weight: 4
    }
  }
}

function listFeatureProperties(props,when){
  let html = "<ul class='ul-segments'>"
  // console.log(JSON.stringify(when.timespan))
  // only non-standard properties
  for(let key of Object.keys(props)) {
    if(["source","target","route_id","segment_id","label","collection"].indexOf(key) < 0) {
      html += "<li><b>"+key+"</b>: "+props[key]+"</li>"
    }
  }
  html += "</ul><div class='segment-when'><p><b>when</b>:</p>"
  // html += parseWhen(when)
  html += "";
  html+="<em>start</em>: "+when.timespan[0]+(when.timespan[1]==""?"":"-"+when.timespan[1])+"<br/>"+
        "<em>end</em>: "+when.timespan[2]+(when.timespan[3]==""?"":"-"+when.timespan[1])+"<br/>"+
        "<em>duration</em>: "+(when.duration==""?"throughout":when.duration)+
        "</div>"
  return html;
}

// from Perio.do, typically
window.loadPeriods = function(pid){
  // https://test.perio.do/---.json
  let l = pid.length
  let collUri = 'https://test.perio.do/' + pid.substring(0,l-4)+'.json'
  console.log('pid, collUri',pid, collUri)
  //period https://test.perio.do/fp7wv2s8c.json
  //collection https://test.perio.do/fp7wv.json
  $.when(
    // vanilla
    $.ajax({
      url: collUri,
      // url: uri,
      dataType: 'json',
      type: 'get',
      crossDomain: true,
      success: function(data) {
        // TODO: prettify json returned
        window.pd=data
        // console.log(JSON.stringify(data.definitions[pid],undefined,2))
        $("#period_pre").html(JSON.stringify(data.definitions['p0'+pid],undefined,2))
      }
    })
  ).done(function(){
    $(".loader").hide()
    $("#period_modal .modal-title").html(pid)
    $("#period_modal").modal(); })
}

var writeCard = function(dataset,attribs){
  // write card and replace intro or append to div#data_abstract
  let html = writeAbstract(attribs)
  html += "download:" +
    " <a href='#' data='"+dataset+"' type='geojson-t'>GeoJSON-T</a>";
  if(["incanto-f","courier"].indexOf(dataset) > -1){
    html += "; <a href='#' data='"+dataset+"' type='d3'>D3 graph</a></div>";
  } else {
    html += "</div>";
  }
  if($("#data_abstract_intro").html() == undefined) {
    $("#data_abstract").append(html);
  } else {
    $("#data_abstract_intro").replaceWith(html);
  }
  $("#data_abstract a").click(function(e){
    download(e.currentTarget.attributes.type.value,
      e.currentTarget.attributes.data.value)
  })
}

// project abstract in right panel
var writeAbstract = function(attribs){``
  if(attribs.periods){
    console.log(attribs.periods[0])
    var foo = '<span class="span-link" onclick="loadPeriods(\''+attribs.periods[0]+'\')">'
  }
  let html = "<div id='"+attribs.lp_id+
    "' class='project-card'><span class='project-card-title'>"+
    attribs.title+"</span>"
    // attribs.short_title+"</span>"
  html += '<p><b>Date</b>: '+attribs.pub_date+'</p>'+
    '<p><b>Contributor(s)</b>: '+attribs.contributors+'<p>'
  html += attribs.periods?
    '<p><b>Period(s)</b>: '+ foo +
    attribs.periods[0]+'</span><p>':''
  html += '<p>'+attribs.description+'</p>'
  return html
}

var download = function(type, data){
  // console.log('download', type,data)
  switch(type) {
    case "d3":
      ga('send', 'event', ['Graph'], ['Click'], ['Linked Data']);
      // console.log('make d3 dataset for '+data+' and load it in force layout somewhere');
      $(".modal-body svg").html('')
      $(".modal-title").html(data)
      // for now, use data in d3graph{}, built on each loadLayer()
      // if(["incanto-f","courier"])
      $(".modal-body").html(buildGraph())
      $('#graph_modal').modal('show');

      break;
    case "geojson-t":
      ga('send', 'event', ['Download'], ['Click'], ['Linked Data']);
      window.open('data/'+data+'.geojson')
      console.log('deliver GeoJSON-T for '+data+' to browser');
      break;
  }
}

window.zapLayer = function(dataset) {
  // uncheck it
  $("input:checkbox[value='"+dataset+"']").prop('checked',false);
  //remove its card from data panel
  $("#lp_"+dataset).remove();
  // remove all div.place-card
  $(".place-card").remove();
  // remove time vis if exists
  if($("#tlvis_"+dataset)){
    $("#tlvis_"+dataset).remove();
  }
  // remove its data from the map
  let name_p = "places_"+dataset;
  let name_s = "segments_"+dataset;
  // console.log(name_p,name_s)
  features[name_p].removeFrom(ttmap);
  features[name_s].removeFrom(ttmap);
  if ($("#data_layers input:checkbox:checked").length == 0){
    ttmap.setView(L.latLng(32.6948,47.4609),2)
    features.bboxes.addTo(ttmap)
  }
}

window.loadLayers = function(arr) {
  // what is already loaded?
  var loadedIDs = $("#data_layers input:checkbox:checked").map(function(){
    return $(this).val();
  }).get();
  // console.log('conflate:',arr,loadedIDs)
  for(let i in loadedIDs){
    if(arr.indexOf(loadedIDs[i]) < 0){
      zapLayer(loadedIDs[i])
    }
  }
  for(let i in arr){
    if(loadedIDs.indexOf(arr[i]) <0){
      // console.log('loading',arr[i])
      // TODO: multiple datasets per project is an issue
      loadLayer(arr[i]=='incanto'?'incanto-f':arr[i])
    }
  }
}

function startMapM(dataset=null){
  bboxFeatures = []
  // var bboxGroup = L.featureGroup()
  // mapbox.js (non-gl)
  L.mapbox.accessToken = 'pk.eyJ1Ijoia2dlb2dyYXBoZXIiLCJhIjoiUmVralBPcyJ9.mJegAI1R6KR21x_CVVTlqw';
  // AWMC tiles in mapbox
  window.ttmap = L.mapbox.map('map', 'isawnyu.map-knmctlkh', {attributionControl: false})
    .setView(L.latLng(40.4165,-3.70256),3)
  var credits = L.control.attribution().addTo(ttmap);
  credits.addAttribution('Tiles and Data © 2013 AWMC CC-BY-NC 3.0 ')
  // window.ttmap = L.mapbox.map('map') // don't load basemap
  if(dataset != null) {loadLayer(dataset);} else {
    // load bboxes
    var bboxLayer = L.mapbox.featureLayer()
      .loadURL('data/bb_all.geojson')
      .on('ready', function(){
        bboxLayer.eachLayer(function(layer){
          bboxFeatures.push(layer)
          layer.bindPopup(blurbs[layer.feature.properties.project],{ closeButton: false})
            .setStyle(mapStyles.bbox)
            .on("mouseover", function(e){
              layer.setStyle({"weight":3});
              layer.openPopup();
            })
            .on("mouseout", function(e){
              layer.setStyle(mapStyles.bbox);
              layer.closePopup();
            })
            // layer.addTo(ttmap)
            layer.on("click", function(e){
              layer.closePopup();
              $('.leaflet-overlay-pane svg g .leaflet-interactive').remove()
              loadLayer(layer.feature.properties.project)
            })
        })
        features['bboxes'] = L.featureGroup(bboxFeatures).addTo(ttmap)
      })
    // global to start
    ttmap.setView(L.latLng(32.6948,47.4609),2)
    // Madrid: (L.latLng(32.6948,-3.70256),2)
  }
}

window.makeDate = function(d){
  // console.log('makeDate from:',d)
  // handle all these: "2016-09-10"; "0494-01"; "23"; "-200"
  let arr = d[0]!='-' ? d.split('-') : d.substring(1,d.length).split('-')
  let year = arr[0].length==2 ? '00'+arr[0] : arr[0].length==1?'000'+arr[0] : arr[0]
  // console.log('arr, year:', arr,year)
  let date = new Date()
  date.setFullYear(d[0]=='-' ? year*-1 : year)
  date.setMonth(arr[1]!=null ? arr[1]-1:0)
  date.setDate(arr[2]!=null ? arr[2]:1)
  return date;
}

window.loadLayer = function(dataset) {
    // console.log('dataset',dataset)
    features.bboxes.removeFrom(ttmap)
    // clear feature arrays
    pointFeatures = [];
    lineFeatures = [];
    d3graph.nodes = [];
    d3graph.links = [];
    // clear previous layer's events if any
    eventsObj.events = [];
    // map id to leaflet layer object
    window.idToFeature[dataset] = {places:{}, segments:{}}

    // TODO: resume managing state in window.href
    // if(searchParams['p'] != undefined){
    //   $("#results_inset").html('<p>Dataset: '+searchParams['d']+
    //     '</p><p>Place:'+searchParams['p']+'</p>')
    // }

    // check in case layer was loaded programatically
    $(":checkbox[value="+dataset+"]").prop("checked","true")

    /*  read a single FeatureCollection of
        Places (geometry.type == Point), and
        Routes (geometry.type == GeometryCollection or undefined)
          - route geometry.geometries[i] == LineString or MultiLineString
    */
    let featureLayer = L.mapbox.featureLayer()
      .loadURL('data/' + dataset + '.geojson')
      .on('ready', function(){
        // get Collection attributes into right panel
        var collection = featureLayer._geojson

        // write dataset card for data panel
        writeCard(dataset,collection.attributes)
        // console.log('collection attributes',collection.attributes)
        // collection range
        var tlRange = [collection.when.timespan[0],collection.when.timespan[3]]
        var tlRangeDates = [makeDate(collection.when.timespan[0]),
          makeDate(collection.when.timespan[3])]
        console.log(tlRange,tlRangeDates)
        // var tlRangeDates = [new Date(collection.when.timespan[0]),
        //   new Date(collection.when.timespan[3])]
        // set period midpoint for timeline
        tlMidpoint = midpoint(collection.when.timespan,'mid')

        // build separate L.featureGroup for points & lines
        featureLayer.eachLayer(function(layer){
          let geomF = layer.feature.geometry
          // TODO: no when in Places yet
          // let whenF = layer.feature.when

          // put places features in pointFeatures array
          if(geomF.type == 'Point') {
              let latlng = new L.LatLng(geomF.coordinates[1],geomF.coordinates[0])

              var placeFeature = new L.CircleMarker(latlng,stylePoints(layer))
              // var placeFeature = new L.CircleMarker(latlng, mapStyles.places)
              // console.log(placeFeature)
              let gazURI = layer.feature.properties.gazetteer_uri

              var popContent = $('<a href="#" gaz="'+gazURI+'">'+
                // layer.feature.properties.toponym+'<br/>'+
                (dataset=='courier'?'TGAZ record':dataset=='vicarello'?'Pleiades record':
                  ['roundabout','xuanzang'].indexOf(dataset)>-1?'Geonames record':'')+'</a>')
                .click(function(e){
                  ga('send', 'event', ['Map'], ['Gaz lookup'], ['Linked Data']);
                  // console.log('gonna get and parse gaz json here',gazURI)
                  $(".loader").show()
                  $.when(
                    $.getJSON(gazURI, function(result){
                      // console.log(result)
                      $("#gaz_pre").html(JSON.stringify(result,undefined,2))
                      // $.each(result, function(i, field){
                      //     $("#gaz_modal .modal-body").append(field + " ");
                      // })
                    })
                  ).done(function(){
                    $(".loader").hide()
                    $("#gaz_modal .modal-title").html(gazURI)
                    $("#gaz_modal").modal(); })
                })
              var searchLink = $('<p class="popup-find-links"><a href="#">Find connections</a></p>')
                .click(function(e){
                  let placeObj = {};
                  placeObj[layer.feature.id]= [dataset,layer.feature.properties.toponym];
                  segmentSearch(placeObj)
                  // alert('one day soon, this will run a search against the index, '+
                  //   'with the same results as using the search feature')
                })

              var toponym = $('<div />').html('<p>'+layer.feature.properties.toponym+'</p>')
                // .append(popContent)[0]
                .append(popContent, searchLink)[0];

              placeFeature.bindPopup(toponym)
              placeFeature.on("click",function(){
                ga('send', 'event', ['Map'], ['Click place'], ['Map']);
              })
              // placeFeature.on("click", function(e){
              //   alert('this will query the ElasticSearch index...')
              // })
              pointFeatures.push(placeFeature)
              var pid = layer.feature.id
              idToFeature[dataset].places[pid] = placeFeature

              // add to links for graph viz for some
              if(["incanto-f","courier"].indexOf(dataset) > -1) {
                    d3graph.nodes.push({"id":pid, "group":"1"})
                  }
          }

          // the rest are line features for routes/segments in GeometryCollection
          else if(geomF.type == 'GeometryCollection') {
            // console.log('layer.feature', layer.feature)
            //* TODO: create feature for each geometry
            // dataRows = '<table><hr><td>id</td><td>label</td></hr>'
            for(let i in geomF.geometries) {
                let whenObj = geomF.geometries[i].when
                let feat = {
                  "type":"Feature",
                  "geometry": {
                    "type":geomF.geometries[i].type,
                    "coordinates":geomF.geometries[i].coordinates
                    },
                  "when": whenObj,
                  "properties": geomF.geometries[i].properties
                }
                //TODO: what does a turf.bezier feature look like?
                // var segment = new L.GeoJSON(turf.bezier(feat), {
                var segment = new L.GeoJSON(feat, {
                  style: stylePaths(feat,tlRangeDates)
                  // style: mapStyles.segments
                }).bindPopup('<b>'+feat.properties.label+'</b><br/>'+
                  listFeatureProperties(feat.properties,feat.when))
                segment.on("click", function(e){
                  ga('send', 'event', ['Map'], ['Click segment'], ['Map']);
                  var leafletId = e.layer._leaflet_id
                  // console.log('clicked this',this)
                  this.setStyle(mapStyles.segments.highlight)
                  // reset color on timeline
                  $(".timeline-event-label").removeClass('timeline-segment-highlight')
                  let date = e.layer.feature.when.timespan[0]
                  var labelId = '#label-tl-'+(timelineCounter - 1)+'-0-'+
                    feat.properties.segment_id
                  console.log('labelId',labelId)
                  // console.log(idToFeature[dataset].segments)
                  ttmap.fitBounds(idToFeature[dataset].segments[feat.properties.segment_id].getBounds())
                }).on("popupclose",function(e){
                  this.setStyle(mapStyles.segments);
                  $(".timeline-event-label").removeClass('timeline-segment-highlight')
                })
                // map id to map feature
                lineFeatures.push(segment)
                // console.log('segment',segment)

                // var sid = feat.properties.route_id
                var sid = feat.properties.hasOwnProperty('segment_id') ?
                  feat.properties.segment_id : feat.properties.route_id
                idToFeature[dataset].segments[sid] = segment

                // add to links for graph viz; skip any with blank target
                if(feat.properties.source != '' && feat.properties.target != ''
                    && ["incanto-f","courier"].indexOf(dataset) > -1) {
                  d3graph.links.push({"id":sid, "source": feat.properties.source,
                    "target": feat.properties.target, "value": dataset=='incanto-f'?
                      feat.properties.num_journeys:"1"})
                }

                //* build event object for time vis
                if (whenObj != ({} || '')) {
                  // if (collection.attributes.segmentType == 'journey') {
                    eventsObj.events.push(buildSegmentEvent(feat));
                  // }
                }
            }
            if(eventsObj.events.length == 0) {
              // needs a period, not bunch of events
              eventsObj.events.push(buildCollectionPeriod(collection))
              // console.log('build',buildCollectionPeriod(collection))
              // console.log('period eventsObj', eventsObj.events[0])
            }
          } else {
            // there is no when in place records yet
            // console.log(whenF == undefined ? 'whenF undef' : whenF)
          }
        })
        // featureGroup pairs as layers
        let name_p = "places_"+dataset
        let name_s = "segments_"+dataset
        _.each(lineFeatures, function(l) {l.addTo(ttmap)})
        features[name_s] = L.featureGroup(lineFeatures).addTo(ttmap)
        features[name_p] = L.featureGroup(pointFeatures).addTo(ttmap)

        // TODO: reconfigure managing state in window.href
        if(searchParams['p'] != undefined) {
          ttmap.setView(idToFeature[dataset].places[searchParams['p']].getLatLng(),8)
          idToFeature[dataset].places[searchParams['p']].openPopup()
        } else {
          ttmap.fitBounds(features[name_p].getBounds())
        }

        // load timeline for journey(s), histogram for others
        window.renderThese = []
        if (collection.attributes.segmentType == 'journey') {
          //// events of unk. duration in year; group and assign faux dates
          // eq. spaced in year on timeline
          window.grpE = _.groupBy(eventsObj.events, function(e){
            return e.start.substring(0,4); })
          _.each(Object.keys(grpE),function(v,k,l){
            var incr = 0
            // for each year...
            _.each(grpE[v],function(v,k,l){
              let tlDot = {}
              tlDot['name'] = v.title
              // if duration, increment days based on #events in year
              tlDot['start'] = eventsObj.events[0]['duration'] == "?" ?
                new Date(v.start).addDays(incr) : new Date(v.start)
              tlDot['end'] = v.end
              renderThese.push(tlDot)
              incr += 365/l.length
            })
          })
          // TODO: set grain dynamically somehow
          if(dataset == 'xuanzang'){grain='year'}
          simpleTimeline(dataset,renderThese,tlRangeDates)
        } else if (collection.attributes.segmentType == 'hRoutes') {
          // multiple routes, assuming start/end date range
          makeHistData(dataset,eventsObj,tlRangeDates)
        } else if (collection.attributes.periods) {
          makePeriodData(collection.attributes.periods)
        }
      })
      $(".loader").hide()
}
$(".leaflet-popup-content a").click(function(e){
  e.preventDefault();
  console.log(e)
})
