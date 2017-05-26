// visjs.org -> vis-timeline-graph2d.min.js
var d3 = Object.assign({}, require("d3"), require("d3-scale"));

window.openTab = function(evt,dataset) {
    window.e = evt
    // console.log('openTab,evt', evt,dataset)
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById("t_"+dataset).style.display = "block";
    // evt.currentTarget.className += " active";

}

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
