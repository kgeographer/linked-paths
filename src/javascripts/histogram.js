
// make a data object D3 histogram likes
// year;count
window.makeHistogram = function(dataset,data){
  console.log('in makeHistogram',data[0])
  var margin = {top: 10, right: 0, bottom: 20, left: 20},
    width = window.innerWidth * 0.95,
    height = 60,
    padding_h = 10,
    padding_w = 40;

    // set the ranges
  var xScale = d3.scaleBand()
    .range([0, width])
    .padding(0.05);
  var yScale = d3.scaleLinear()
    .range([height, 0]);

  var svg_hist = d3.select("#tl").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("id", "tlvis_"+dataset)
  .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")")

  xScale.domain(data.map(function(d) { return d.year; }));
  yScale.domain([0, d3.max(data, function(d) { return d.count; })]);

  window.axisB = d3.axisBottom(xScale)
    .tickValues(xScale.domain().filter(function(d,i){ return !(i%10)}));
    // .tickFormat(d3.timeFormat("%a %d"))

  svg_hist.selectAll(".bar")
    .data(data)
  .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return xScale(d.year); })
    .attr("width", xScale.bandwidth())
    .attr("y", function(d) { return yScale(d.count); })
    .attr("height", function(d) { return height - yScale(d.count); });

  window.hAxis = svg_hist.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(axisB)
  // svg_hist.append("g")
  //     .call(d3.axisLeft(y));
}



window.makeFlowHistData = function(dataset,yrgroups,tlRangeDates){
  window.bins = []
  window.range=tlRangeDates
  _.each(yrgroups,function(k,v){
    bins.push({"year":parseInt(v),"count":k});
  })
  makeHistogram(dataset, bins)
}

window.makeHistData = function(dataset,eventsObj,tlRangeDates){
  window.bins = []
  window.range=tlRangeDates
  var r0 = range[0].getFullYear()
  var r1 = range[1].getFullYear()
  for(let i=r0; i <= r1; i+=100) {
    let obj = {"year": i, "count": 0}
    bins.push(obj)
  }
  _.each(eventsObj.events,function(e) {
    // console.log(parseInt(v.start),parseInt(v.end))
    _.each(bins, function(b,i){
      // console.log('b,i:',b,i)
      // console.log('k,v.start,v.end:',k,e.start,e.end)
      if(b.year >= parseInt(e.start) && b.year <= parseInt(e.end)){
        // console.log('k,e.start,e.end:',k,e.start,e.end)
        bins[i]['count'] +=1
      }
    })
  })
  makeHistogram(dataset, bins)
}
