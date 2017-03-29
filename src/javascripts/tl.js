// var d3 = Object.assign({}, require("d3"), require("d3-scale"));

window.filterEvents = function(selRange) { // [start,end]
  var d0 = selRange[0],
      d1 = selRange[1];
  // console.log('selRange',selRange)
  // console.log('selRange',d0,d1)
  _.each(lineFeatures, function(l) {
    l.eachLayer(function(layer){
      let featuredate = new Date(layer.feature.when.timespan[0])
      // console.log('d0,d1,featuredate',d0,d1,featuredate)
      if(featuredate < d0 || featuredate > d1) {
        // console.log('d0,d1,featuredate',d0,d1,featuredate)
        layer.removeFrom(ttmap)
      } else {
          // console.log('nope')
          layer.addTo(ttmap)
      }
    })
  })
}

// helper method to increment x placement
Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}
var width = window.innerWidth,
    height = 40,
    padding_h = 10,
    padding_w = 40;

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var brushended = function(){
  var s = d3.event.selection;
  var selRange = s.map(xScale.invert)
  console.log('brushended grain, selRange', grain, selRange)
  filterEvents(selRange)
}
var brushendedZ = function(){
  console.log('in brushendedZ')
  var s = d3.event.selection;
  if(grain == 'year'){
    var selRange = s.map(xScale.invert).map(d3.timeYear.round)
    // d3.select(this).transition().call(d3.event.target.move, selRange.map(xScale))
  } else {
    var selRange = s.map(xScale.invert)
  }
  // console.log('brushendedZ grain, selRange:', grain, selRange)
  filterEvents(selRange)
}
window.brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on("end", brushendedZ );
    // .on("end", grain == 'year' ? brushendedY : brushended );

window.simpleTimeline = function(dataset,events,tlrange){
  // if there's one already, zap it
  // $("#tlvis").remove()
  // create an svg container
  var vis = d3.select("#tl").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "tlvis_"+dataset);

    window.yScale = d3.scaleLinear()
      .domain([0, 100])    // values between 0 and 100
      .range([height - padding_h, padding_h]);

    // define the x scale (horizontal)
    var mindate = new Date(tlrange[0]),
        maxdate = new Date(tlrange[1]);

        var d = new Date();
         d.setDate(d.getDate()-5);

    window.xScale = d3.scaleTime()
      .domain([mindate, maxdate])
      .range([padding_w, width - padding_w * 2]);

    // define the y axis
    var yAxis = d3.axisLeft()
        .scale(yScale);

    // define the y axis
    var xAxis = d3.axisBottom()
        .scale(xScale);

    // draw y axis with labels and move in from the size by the amount of padding
    // vis.append("g")
    //   .attr("class","axis")
    //     .attr("transform", "translate("+padding+",0)")
    //     .call(yAxis);

    // draw x axis with labels and move to the bottom of the chart area
    vis.append("g")
        .attr("class", "axis xaxis")
        .attr("transform", "translate(0,20)")
        // .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis);

    window.gBrush = vis.append("g")
        .attr("class", "brush")
        .call(brush);

    vis.selectAll("circle")
      .data(events)
    .enter()
      .append("circle")
      .attr('r',6)
      .attr("class","event")
      .attr('fill', function(d){
        return colorMap[dataset]
      })
      // .attr("fill", "orange")
      .attr('cx', function(d){
        return xScale(new Date(d.start))
      })
      .attr('cy', 20)
      // .attr('cy', yScale(0))
      .on("mouseover", function(d) {
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.text(d.name)
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
        })
      .on("mouseout", function(d) {
        div.transition()
          .duration(500)
          .style("opacity", 0);
        })

    gBrush.call(brush.move, [mindate, maxdate].map(xScale));

}
// fires from startMap() after data is loaded
window.initTimeline = function(events,dataset) {
  // console.log('initTimeline events',events)
  // custom timeline click event
  Timeline.OriginalEventPainter.prototype._showBubble = function(x, y, evt) {
    ga('send', 'event', ['Timeline'], ['Click event'], ['Timeline']);
    // popup segment event/period
    window.evt = evt
    console.log('timeline evt obj', evt)
    let name_s = 'segments_'+dataset
    features[name_s].setStyle({'color':'gray'})

    // journey segment popup on map
    if(tlConfig[dataset].type == 'journey'){
      // case dataset is journey(s)
      idToFeature[dataset].segments[evt._id].openPopup()
        .setStyle({'color':'red'})
      idToFeature[dataset].segments[evt._id].on("popupclose", function(e){
        this.setStyle({'color':'gray'})
      })
      ttmap.fitBounds(idToFeature[dataset].segments[evt._id].getBounds())
    } else {
      $('#period_modal .modal-header h4').html(evt._text)
      $('#period_modal .modal-body p').html(evt._description+"<br/>"
        +evt._start.getFullYear()
        +";"+evt._latestStart.getFullYear()
        +";"+evt._earliestEnd.getFullYear()
        +";"+evt._end.getFullYear()
        )
      $('#period_modal').modal('show');
    }
  }

  window.eventSrc = new Timeline.DefaultEventSource(0);
  // Example of changing the theme from the defaults
  // The default theme is defined in
  // http://simile-widgets.googlecode.com/svn/timeline/tags/latest/src/webapp/api/scripts/themes.js
  var theme = Timeline.ClassicTheme.create();
  theme.event.bubble.width = 320;
  // theme.event.bubble.height = 300;
  theme.ether.backgroundColors[1] = theme.ether.backgroundColors[0];

  let cfg = tlConfig[dataset]
  var d = Timeline.DateTime.parseGregorianDateTime(tlMidpoint)
  // console.log('midpoint d',d)
  // var d = Timeline.DateTime.parseGregorianDateTime(tlMidpoint)
  // DAY, WEEK, MONTH, YEAR, DECADE, CENTURY
  var bandInfos = [
    Timeline.createBandInfo({
        width:          cfg.width1,
        // width:          "75%",
        intervalUnit:   eval('Timeline.DateTime.'+cfg.intUnit1),
        // intervalPixels: 50,
        intervalPixels: cfg.intPixels1,
        eventSource:    eventSrc,
        date:           d,
        theme:          theme,
        layout:         'original'  // original, overview, detailed
    }),
    Timeline.createBandInfo({
        width:          cfg.width2,
        // width:          "25%",
        intervalUnit:   eval('Timeline.DateTime.'+cfg.intUnit2),
        intervalPixels: cfg.intPixels2,
        // intervalPixels: 120,
        eventSource:    eventSrc,
        date:           d,
        theme:          theme,
        layout:         'overview'  // original, overview, detailed
    })
  ];
  bandInfos[1].syncWith = 0;
  bandInfos[1].highlight = true;

  window.tl = Timeline.create(document.getElementById("tl"), bandInfos, Timeline.HORIZONTAL);
  // from the dynamic object; needs a dummy url
  eventSrc.loadJSON(events, 'dummyUrl');

  timelineCounter += 1;
}
