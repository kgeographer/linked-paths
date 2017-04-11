// simple D3 circles on x axis with brush

// var d3 = Object.assign({}, require("d3"), require("d3-scale"));

window.filterEvents = function(selRange) { // [start,end]
  // subtract 1 day to acccount for timezone
  var d0 = selRange[0].addDays(-1),
      d1 = selRange[1];
  // console.log('selRange',selRange)
  // console.log('selRange',d0,d1)
  _.each(lineFeatures, function(l) {
    l.eachLayer(function(layer){
      // console.log('layer',layer)
      let featuredate = new Date(layer.feature.when.timespan[0])
      // console.log('d0,d1,featuredate',d0,d1,featuredate)
      if(featuredate <= d0 || featuredate >= d1) {
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
// helper method to increment x placement
Date.prototype.addYears = function(years) {
  var dat = new Date(this.valueOf());
  dat.setYear(dat.getFullYear() + years);
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

var brushendedZ = function(){
  var s = d3.event.selection;
  if(grain == 'year'){
    var selRange = s.map(xScale.invert).map(d3.timeYear.round)
  } else {
    var selRange = s.map(xScale.invert)
  }
  // console.log('brushendedZ grain, selRange:', grain, selRange)
  filterEvents(selRange)
}

window.brush = d3.brushX()
    // .extent([new Date(628,0,1),new Date(646,12,31)])
    .extent([[0, 0], [width, height]])
    .on("end", brushendedZ );

window.simpleTimeline = function(dataset,events,tlrange){
  // if there's one already, zap it
  // $("#tlvis").remove()
  // console.log('simpleTimeline range:',new Date(tlrange[0]), new Date(tlrange[1]))
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
    if(dataset == 'roundabout'){
      mindate=mindate.addDays(-1)
    } else if(dataset == 'xuanzang') {
      mindate=mindate.addDays(-1)
      maxdate=maxdate.addYears(1)
    }
    // console.log('mindate,maxdate',mindate,maxdate)
    window.xScale = d3.scaleTime()
      // subtract 1 day to account for timezone when grain = day
      .domain([mindate, maxdate])
      .range([padding_w - 10, width - (padding_w*2)]);

    // define the y axis
    var yAxis = d3.axisLeft()
        .scale(yScale);

    // define the x axis
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
        .call(xAxis);

    window.gBrush = vis.append("g")
        .attr("class", "brush")
        .call(brush)

    // gBrush.call(brush.move, xScale.range());

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
        // console.log('cx(d)', xScale(new Date(d.start)))
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

    gBrush.call(brush.move, xScale.range());
    // gBrush.call(brush.move, [mindate, maxdate].map(xScale));

}
