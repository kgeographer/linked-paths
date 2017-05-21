// visjs.org -> vis-timeline-graph2d.min.js
var d3 = Object.assign({}, require("d3"), require("d3-scale"));

window.makeTimeVis = function(periodArray,pid){
  // console.log('focal period',pid)
  var container = document.getElementById('tl');
  // Configuration for the Timeline
  var options = {
    autoResize: true,
    // autoResize: false,
    margin: {
      axis: 8,
      item: {
        vertical: 4
      }
    },
    tooltip: {
      followMouse: true
    }
    // margin.item.vertical: 24
  };
  // Create a Timeline
  var timeline = new vis.Timeline(container, periodArray, options)

}
