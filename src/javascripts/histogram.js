
// make a data object D3 histogram likes
// year;count
window.makeHistogram = function(dataset,data){
  console.log('in makeHistogram')
  var margin = {top: 10, right: 0, bottom: 20, left: 20},
    width = window.innerWidth * 0.95,
    height = 60,
    padding_h = 10,
    padding_w = 40;

    // set the ranges
  var x = d3.scaleBand()
    .range([0, width])
    .padding(0.05);
  var y = d3.scaleLinear()
    .range([height, 0]);

  var svg_hist = d3.select("#tl").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform","translate(" + margin.left + "," + margin.top + ")")
    .attr("id", "tlvis_"+dataset);;

  x.domain(data.map(function(d) { return d.year; }));
  y.domain([0, d3.max(data, function(d) { return d.count; })]);

  svg_hist.selectAll(".bar")
    .data(data)
  .enter().append("rect")
    .attr("class", "bar")
    .attr("x", function(d) { return x(d.year); })
    .attr("width", x.bandwidth())
    .attr("y", function(d) { return y(d.count); })
    .attr("height", function(d) { return height - y(d.count); });

  svg_hist.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  // svg_hist.append("g")
  //     .call(d3.axisLeft(y));
}


// x.domain(data.map(function(d) { return d.letter; }));
// y.domain([0, d3.max(data, function(d) { return d.frequency; })]);

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
  // console.log('bins',bins)
  // console.log('dataset,eventsObj,tlRangeDates',dataset,eventsObj,tlRangeDates)
  makeHistogram(dataset, bins)
  console.log('extent:',tlRangeDates[1].getFullYear() - tlRangeDates[0].getFullYear())
  // $("#tl").html('<h2>a histogram</h2>')
}
