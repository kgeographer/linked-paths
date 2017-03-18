// var d3 = Object.assign({}, require("d3"), require("d3-scale"));

// helper to increment y placement
Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}
var width = window.innerWidth,
    height = 200,
    padding = 100;

// Define the div for the tooltip
var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

window.simpleTimeline = function(events,tlrange){
  // if there's one already, zap it
  $("#tlvis").remove()
  // create an svg container
  var vis = d3.select("#tl").append("svg:svg")
      .attr("width", width)
      .attr("height", height)
      .attr("id", "tlvis");

  var colorScale = d3.scaleOrdinal()
    .domain(["European","Native","Colonial","Latin America","Internal"])
    .range(["#96abb1", "#313746", "#b0909d", "#687a97", "#292014"]);

  // d3.csv("data/wars.csv", function (csv) {
    window.yScale = d3.scaleLinear()
      .domain([0, 100])    // values between 0 and 100
      .range([height - padding, padding]);

    // define the x scale (horizontal)
    var mindate = new Date(tlrange[0]),
        maxdate = new Date(tlrange[1]);
    // var mindate = new Date(tlrange[0],1,1),
    //     maxdate = new Date(tlrange[1],12,31);

    window.xScale = d3.scaleTime()
      .domain([mindate, maxdate])
      .range([padding, width - padding * 2]);   // map these the the chart width = total width minus padding at both sides

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
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis);

    vis.selectAll("circle")
      .data(events)
    .enter()
      .append("circle")
      .attr('r',6)
      .attr("class","event")
      .attr("fill", "orange")
      .attr('cx', function(d){
        return xScale(new Date(d.start))
      })
      .attr('cy', yScale(0))
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
        });
      // .attr('fill', function(d){
      //   return colorScale(d.sphere)
      // })
  // })

}
