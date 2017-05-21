// visjs.org -> vis-timeline-graph2d.min.js
var d3 = Object.assign({}, require("d3"), require("d3-scale"));

window.makeTimeVis = function(periodArray,dataset,pid){
  console.log('dataset,pid',dataset, pid)
  var newdiv = document.createElement('div')
  newdiv.setAttribute("id", "tlvis_"+dataset);
  var container = document.getElementById('tl');
  container.appendChild(newdiv)
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
  var timeline = new vis.Timeline(newdiv, periodArray, options)
  // var timeline = new vis.Timeline(container, periodArray, options)

}
