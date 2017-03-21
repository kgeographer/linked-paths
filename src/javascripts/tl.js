// var d3 = Object.assign({}, require("d3"), require("d3-scale"));
// var _ = require('underscore')

window.filterEvents = function(rangedates) { // [start,end]
  var d0 = rangedates[0], d1 = rangedates[1];
  // var d0 = new Date(range[0]), d1 = new Date(range[1]);
  // console.log(range,d0,d1)
  _.each(lineFeatures, function(l) {
    l.eachLayer(function(layer){
      let featuredate = new Date(layer.feature.when.timespan[0])
      // console.log('d0,d1,featuredate',d0,d1,featuredate)
      if(featuredate < d0 || featuredate > d1) {
        console.log('d0,d1,featuredate',d0,d1,featuredate)
        layer.removeFrom(ttmap)
      } else {console.log('nope')
          layer.addTo(ttmap)
      }
    })
  })
}

// helper to increment x placement
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
  var sx = s.map(xScale.invert);
  // xScale.domain(selection.map(x2.invert, x2));
  // focus.selectAll(".dot")
  //       .attr("cx", function(d) { return x(d.date); })
  //       .attr("cy", function(d) { return y(d.price); });
  // focus.select(".axis--x").call(xAxis);
  filterEvents(sx)
  console.log('brushended, do something w/this',sx)
}
window.brush = d3.brushX()
    .extent([[0, 0], [width, height]])
    .on("end", brushended);

window.simpleTimeline = function(dataset,events,tlrange){
  // if there's one already, zap it
  // $("#tlvis").remove()
  // create an svg container
  var vis = d3.select("#tl").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "tlvis_"+dataset);

  // var colorScale = d3.scaleOrdinal()
  //   .domain(["European","Native","Colonial","Latin America","Internal"])
  //   .range(["#96abb1", "#313746", "#b0909d", "#687a97", "#292014"]);

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
