var d3 = Object.assign({}, require("d3"), require("d3-scale"));
Date.prototype.addDays = function(days) {
  var dat = new Date(this.valueOf());
  dat.setDate(dat.getDate() + days);
  return dat;
}
window.simpleTimeline = function(events,start,end){
// window.simpleTimeline = function(data){
  var width = window.innerWidth,
      height = 200,
      padding = 100;

  // create an svg container
  var vis = d3.select("#tl").
      append("svg:svg")
          .attr("width", width)
          .attr("height", height);
  var colorScale = d3.scaleOrdinal()
    .domain(["European","Native","Colonial","Latin America","Internal"])
    .range(["#96abb1", "#313746", "#b0909d", "#687a97", "#292014"]);

  // d3.csv("data/wars.csv", function (csv) {
    // define the y scale  (vertical)
    window.yScale = d3.scaleLinear()
      .domain([0, 100])    // values between 0 and 100
      .range([height - padding, padding]);
      // map these to the chart height, less padding.

    // define the x scale (horizontal)
    var mindate = new Date(start,1,1),
    // var mindate = new Date(1770,1,1),
    // var mindate = new Date(1283,0,1),
        maxdate = new Date(end,12,31);
        // maxdate = new Date(1880,12,31);

    window.xScale = d3.scaleTime()
    // var xScale = d3.time.scale()
      .domain([mindate, maxdate])    // values between for month of january
        .range([padding, width - padding * 2]);   // map these the the chart width = total width minus padding at both sides

    // define the y axis
    var yAxis = d3.axisLeft()
        // .orient("left")
        .scale(yScale);

    // define the y axis
    var xAxis = d3.axisBottom()
        // .orient("bottom")
        .scale(xScale);

    // draw y axis with labels and move in from the size by the amount of padding
    // vis.append("g")
    //   .attr("class","axis")
    //     .attr("transform", "translate("+padding+",0)")
    //     .call(yAxis);

    // draw x axis with labels and move to the bottom of the chart area
    vis.append("g")
        .attr("class", "axis xaxis")   // give it a class so it can be used to select only xaxis labels  below
        .attr("transform", "translate(0," + (height - padding) + ")")
        .call(xAxis);

    vis.selectAll("circle")
      .data(events)
      // .data(csv)
      .enter()
      .append("circle")
      .attr('cx', function(d){
        return xScale(new Date(d.start))
      })
      .attr('cy', yScale(0))
      .attr('r',6)
      .attr("class","event")
      .attr("fill", "orange")
      // .attr('fill', function(d){
      //   return colorScale(d.sphere)
      // })
  // })

}
