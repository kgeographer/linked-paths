var url = require('url'),
    querystring = require('querystring'),
    moment = require('moment'),
    _ = require('underscore')
window._ = _
require('mapbox.js')
var turf = require('turf')

moment().format();
// import add'l app JavaScript
import './bloodhound.js';
// reque('@turf/centroid')
// require('@turf/buffer')

// exposed for debugging
window.parsedUrl = url.parse(window.location.href, true, true);
window.searchParams = querystring.parse(parsedUrl.search.substring(1));
window.features = {};
window.d3graph = {"nodes":[], "links":[]}
window.idToFeature = {};
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
window.isFlow = false;

// on start listeners
$(function() {
  // TODO: restore state in href approach (?)
  Object.getOwnPropertyNames(searchParams).length == 0 ?
    startMapM() : startMapM(searchParams['d'],searchParams['p'])
  $("#menu").click(function(){
    $("#data").toggle("fast")
  })
  $(".data-header").html(searchParams['d'])
  $('#data_layers .checkbox').mouseover(function(e){
    if ($(".checkbox input:checkbox:checked").length == 0){
      let dataset = this.childNodes[1].childNodes[0].value
      idToFeature.bboxes[dataset].setStyle({"weight":3})
      idToFeature.bboxes[dataset].openPopup();
    }
  })
  $('#data_layers .checkbox').mouseout(function(e){
    if ($(".checkbox input:checkbox:checked").length == 0){
      let dataset = this.childNodes[1].childNodes[0].value
      idToFeature.bboxes[dataset].setStyle({"weight":1})
      idToFeature.bboxes[dataset].closePopup();
    }
  })
  $("input:checkbox").change(function(){
    if(this.checked == true) {
      if(searchParams['p'] == undefined) {
        ga('send', 'event', ['Layers'], ['Check'], ['Data panel']);
        $("#tl").show()
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
    window.open('http://kgeographer.com/linked-places-v0-2/', '', 'width=700');
  })
  $(".tablinks").click(function(e){
    console.log('creating timevis div for ',this.value)
  })
});

function onResize() {
    if (resizeTimerID == null) {
        resizeTimerID = window.setTimeout(function() {
            resizeTimerID = null;
            tl.layout();
        }, 500);
    }
}

var fixDate = function(d){
  let foo = moment(d).toISOString()
  return foo;
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
  // console.log(feature.toGeoJSON().properties.collection)
  let fill=colorMap[feature.toGeoJSON().properties.collection]
  let rad=feature.toGeoJSON().properties.collection=='owtrad'?2:4;
  // console.log('fill',fill)
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

// from Perio.do
// uri examples:
// period https://test.perio.do/fp7wv2s8c.json
// collection https://test.perio.do/fp7wv.json
var loadPeriods = function(dataset,uri){
  let len = uri.length
  // derive collection uri
  let collUri = uri.substring(0,len-9)+'.json'
  // extract individual period pid
  let pid = uri.substring(len-14,len-5)
  let collLocal = 'data/'+uri.substring(22,len-9)+'.json'
  console.log(uri,collUri,collLocal)
  $.when(
    $.ajax({
      url: collUri, // get whole collection
      // url: uri,
      dataType: 'json',
      type: 'get',
      crossDomain: true,
      success: function(data) {
        // build pdsContext (intersecting periods)
        window.pdefs=data.definitions
        let pidRange = [pdefs['p0'+pid].start.in.year,pdefs['p0'+pid].stop.in.year]
        let pdsRange = [_.min(pdefs, function(pd){ return pd.start.in.year }),
            _.max(pdefs, function(pd){ return pd.stop.in.year })
          ];
        let pdsRangeYears = [pdsRange[0].start.in.year,pdsRange[1].stop.in.year]
        window.pdsContext = _.filter(pdefs,function(pdef){
          return pdef.start.in.year <= pidRange[1] && pdef.stop.in.year >= pidRange[0];
        })
      },
      timeout: 2000,
      error: function (jqXHR, exception) {
              var msg = '';
              if (jqXHR.status === 0) {
                  $("#t_"+dataset).html('<p>Period data for <b>'+dataset+
                    '</b> is not available right now, sorry!</p>');
                  $(".loader").hide()
              } else if (jqXHR.status == 404) {
                  msg = 'Requested page not found. [404]';
              } else if (jqXHR.status == 500) {
                  msg = 'Internal Server Error [500].';
              } else if (exception === 'parsererror') {
                  msg = 'Requested JSON parse failed.';
              } else if (exception === 'timeout') {
                  msg = 'Time out error.';
              } else if (exception === 'abort') {
                  msg = 'Ajax request aborted.';
              } else {
                  msg = 'Uncaught Error.\n' + jqXHR.responseText;
              }
          }
    })
  ).done(function(){
    // format for timeline
    window.periodArray = []
    _.each(pdsContext, function(p){
    // _.each(pds.definitions, function(p){
      var pd = {}
      // console.log(p.id,p.label,p.start.in.year,p.stop.in.year)
      pd['id'] = p.id
      pd['content'] = p.label
      pd['start'] = makeDate(p.start.in.year)
      pd['end'] = makeDate(p.stop.in.year)
      pd['className'] = p.id == 'p0'+pid ? 'orange' : 'vis-item'
      pd['title'] = p.note
      periodArray.push(pd)
    })
    makeTimeVis(periodArray,dataset,pid)

    $(".loader").hide()
  })
}

var writeCard = function(dataset,attribs){
  // write card and replace intro or append to div#data_abstract
  let html = writeAbstract(attribs)
  html += "<b>Download: </b>" +
    "<a href='#' data='"+dataset+"' type='geojson-t'>GeoJSON-T</a>";
  if(["incanto","courier"].indexOf(dataset) > -1){
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

// per project, in right panel
var writeAbstract = function(attribs){
  // console.log('attribs.periods',attribs.periods)
  let html = "<div id='"+attribs.lp_id+
    "' class='project-card'><span class='project-card-title'>"+
    attribs.title+"</span>"
  html += '<p><b>Date</b>: '+attribs.pub_date+'</p>' +
    '<p><b>Contributor(s)</b>: '
  for(let i in attribs.contributors) {
    html += (i < attribs.contributors.length -1) ?
      attribs.contributors[i]['name'] +'; ' :
      attribs.contributors[i]['name']
    }
  html += '</p>'
  html += (attribs.periods[0]['name'] != '') ?
    '<p><b>Period(s)</b>: <span>'+attribs.periods[0]['name']+'</span><p>' : ''
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

var zapLayer = function(dataset) {
  // if < 2 projects loaded, enable checkboxes
  if($("#data_layers input:checkbox:checked").length < 2){
    $("input:checkbox:not(:checked)").attr("disabled",false)
  }
  // uncheck it
  dataset = dataset.slice(-2)[0]=='-' ? dataset.slice(0,-2) : dataset
  $("input:checkbox[value='"+ dataset +"']").prop('checked',false);
  // console.log('want to zap: dataset',dataset)
  // remove its card from data panel
  $("#lp_"+dataset).remove();
  // remove all div.place-card
  $(".place-card").remove();
  // remove time vis if exists
  // TODO: dataset id for timevis, remove by id
  $("#t_"+dataset).remove()
  let numproj = $("#data_layers input:checkbox:checked").length
  console.log('numproj',numproj)
  if(numproj == 1){
    let lastProj = $("#data_layers input:checkbox:checked")[0].value
    document.getElementById("t_"+lastProj).style.display = "block";
  } else if (numproj == 0) {
    $("#tl").hide()
  }
  $("#b_"+dataset).remove()

  // $("#tlvis_"+dataset).remove()
  // remove its data from the map
  let name_p = "places_"+dataset;
  let name_s = "segments_"+dataset;
  // console.log(name_p,name_s)
  features[name_p].removeFrom(ttmap);
  features[name_s].removeFrom(ttmap);
  if ($("#data_layers input:checkbox:checked").length == 0){
    ttmap.setView(L.latLng(32.6948,47.4609),2)
    if (features.bboxes) {
      features.bboxes.addTo(ttmap)
    } else {
      location.href = location.origin+location.pathname
    }
  }
}

var loadLayers = function(arr) {
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
}

function startMapM(dataset=null){
  idToFeature['bboxes'] = {}
  //idToFeature[dataset].places[pid] = placeFeature
  window.bboxFeatures = []
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
          idToFeature['bboxes'][layer.feature.properties.project] = layer
          // console.log(layer.feature.properties.project)
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

var makeDate = function(d){
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

var loadLayer = function(dataset) {
  // if two projects are loaded, disable checkboxes
  if($("#data_layers input:checkbox:checked").length == 2){
    $("input:checkbox:not(:checked)").attr("disabled",true)
  }
  $(".loader").show()
  // check checkbox in case layer was loaded programatically
  $(":checkbox[value='"+dataset+"']").prop("checked","true")
  isFlow = dataset == 'incanto' ? true : false;
  if(features.bboxes) {features.bboxes.removeFrom(ttmap)}
  // clear feature arrays
  pointFeatures = [];
  lineFeatures = [];
  d3graph.nodes = [];
  d3graph.links = [];
  // clear previous layer's events if any
  eventsObj.events = [];
  // map id to leaflet layer object
  window.idToFeature[dataset] = {places:{}, segments:{}}

  // TODO: manage state in window.href

  /*  read a single FeatureCollection of
      Places (geometry.type == Point), and
      Routes (geometry.type == GeometryCollection or undefined)
        - route geometry.geometries[i] == LineString or MultiLineString
  */
  let featureLayer = L.mapbox.featureLayer()
    .loadURL('data/' + dataset + '.geojson')
    .on('ready', function(){
      window.collection = featureLayer._geojson
      // get dataset attributes into right panel
      window.projConfig = projects[dataset]
      // console.log('projConfig', projConfig)
      // y-axis label for histogram magnitudes
      var yLabel = projConfig.timevis.label
      // write dataset card for data panel
      writeCard(dataset,projConfig)

      window.tlRangeDates = [makeDate(collection.when.timespan[0]),
        makeDate(collection.when.timespan[3])]

      // build separate L.featureGroups for points & lines
      featureLayer.eachLayer(function(layer){
        let geomF = layer.feature.geometry
        // TODO: no when in Places yet
        // let whenF = layer.feature.when

        // put places features in pointFeatures array
        if(geomF.type == 'Point') {
            let latlng = new L.LatLng(geomF.coordinates[1],geomF.coordinates[0])

            var placeFeature = new L.CircleMarker(latlng,stylePoints(layer))
            // console.log('layer.feature.properties',layer.feature.properties)
            let gazURI = layer.feature.properties.exact_matches.length>0?
              layer.feature.properties.exact_matches[0].uri:""
            // console.log(gazURI)
            var popContent = $('<a href="#" gaz="'+gazURI+'">'+
              (dataset=='courier'&&gazURI!="" ? 'TGAZ record':
                ['vicarello','bordeaux'].indexOf(dataset)>-1 ? 'Pleiades record':
                ['roundabout','xuanzang','incanto'].indexOf(dataset)>-1?'Geonames record':'')+'</a>')
              .click(function(e){
                ga('send', 'event', ['Map'], ['Gaz lookup'], ['Linked Data']);
                $(".loader").show()
                $.when(
                  $.getJSON(gazURI, function(result){
                    // console.log(result)
                    $("#gaz_pre").html(JSON.stringify(result,undefined,2))
                  })
                ).done(function(){
                  $(".loader").hide()
                  $("#gaz_modal .modal-title").html(gazURI)
                  $("#gaz_modal").modal(); })
              })
            var searchLink = $('<p class="popup-find-links"><a href="#">Find connections</a></p>')
              .click(function(e){
                let placeObj = {};
                placeObj[layer.feature.id]= [[dataset,layer.feature.properties.toponym,
                  layer.feature.id]];
                // placeObj[payload.id] = [[project, payload.title, payload.id]];
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
            // clear connection results on place popup close
            placeFeature.on("popupclose", function(){
              $(".place-card").remove()
            })
            pointFeatures.push(placeFeature)
            var pid = layer.feature.id
            idToFeature[dataset].places[pid] = placeFeature

            // add to links for graph viz for some
            if(["incanto","courier"].indexOf(dataset) > -1) {
                  d3graph.nodes.push({"id":pid, "group":"1"})
                }
        }

        // the rest are line features for routes/segments in GeometryCollection
        else if(geomF.type == 'GeometryCollection') {
          // console.log('dataset: layer.feature', dataset, layer.feature)
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
                  && ["incanto","courier"].indexOf(dataset) > -1) {
                d3graph.links.push({"id":sid, "source": feat.properties.source,
                  "target": feat.properties.target, "value": dataset=='incanto'?
                    feat.properties.num_journeys:"1"})
              }

              //* build event object for time vis
              if (whenObj != ({} || '')) {
                // if (collection.attributes.segmentType == 'journey') {
                  eventsObj.events.push(buildSegmentEvent(feat));
                // }
              }
          }
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

      // TIME
      // period-timeline: bordeaux, courier, vicarello
      // histogram-flow: incanto
      // histogram: owtrad
      // event-timeline: roundabout, xuanzang
      addTimeDiv(dataset)
      window.renderThese = []
      if(["histogram-flow","event-timeline"].indexOf(projConfig.timevis.type) > -1 ) {
        // roundabout, xuanzang, incanto
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

        if(projConfig.timevis.type == "event-timeline") {
          // roundabout, xuanzang
          simpleTimeline(dataset,renderThese,tlRangeDates)
          } else {
          // incanto flows
          window.yrgroups = _.countBy(renderThese,function(l){
            return l.start.getFullYear();
            })
          makeFlowHistData(dataset,yrgroups,tlRangeDates,yLabel)
        }
      } else if (projConfig.timevis.type == "period-timeline") {
        // bordeaux, courier, vicarello
        loadPeriods(dataset,projConfig.periods[0]['uri'])
      } else if (projConfig.timevis.type == "histogram") {
        // owtrad
        makeHistData(dataset,eventsObj,tlRangeDates,yLabel)
      }
  })
}
window.addTimeDiv = function(dataset){
  // if there's already > 0 tabs, remove active class
  if($("#tltabs").length > 0){
    $(".tablinks").removeClass("active")
    $(".tabcontent").css("display","none")
  }
  // add a button to #tltabs, make 'active'
  let b = $('<button id="b_'+dataset+'" class="tablinks active" onclick="openTab(event,\''+
    dataset+'\')">'+dataset+'</button>')
  $("#tltabs").append(b)
  // add a content div to #tl
  let tldiv = $('<div id="t_'+dataset+'" class="tabcontent"></div>')
  $("#tl").append(tldiv)
}

$(".leaflet-popup-content a").click(function(e){
  e.preventDefault();
  console.log(e)
})
