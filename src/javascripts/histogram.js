
// make a data object D3 histogram likes
// year;count
var makeHistogram = function(d){
  var margin = {top: 0, right: 0, bottom: 0, left: 0},
    width = window.innerWidth,
    height = 40,
    padding_h = 10,
    padding_w = 40;
  var svg_hist = d3.select("tl").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

  x.domain(data.map(function(d) { return d.year; }));
  y.domain([0, d3.max(data, function(d) { return d.count; })]);


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
  makeHistogram(bins)
  console.log('extent:',tlRangeDates[1].getFullYear() - tlRangeDates[0].getFullYear())
  // $("#tl").html('<h2>a histogram</h2>')
}
