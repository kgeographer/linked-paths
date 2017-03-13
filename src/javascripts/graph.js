var d3 = Object.assign({}, require("d3"), require("d3-scale"));

window.buildGraph = function(){
  var edgeScale = d3.scaleLinear()
    .domain([1,100])
    .range([1,5])

  // console.log('current d3graph',d3graph)
  var svg = d3.select(".modal-body svg"),
    width = +svg.attr("width"),
    height = +svg.attr("height");

  var color = d3.scaleOrdinal(d3.schemeCategory20);

  var simulation = d3.forceSimulation()
      .force("link", d3.forceLink().id(function(d) { return d.id; }))
      .force("charge", d3.forceManyBody())
      .force("center", d3.forceCenter(width / 2, height / 2));

  // var graph = JSON.parse(d3graph)
  // for now, use data in d3graph{}, built on each loadLayer()
  // d3.json(d3graph, function(error, graph) {
  // d3.json(JSON.parse(d3graph), function(error, graph) {
    // if (error) throw error

    var link = svg.append("g")
        .attr("class", "links")
      .selectAll("line")
      .data(d3graph.links)
      .enter().append("line")
        .attr("stroke-width", function(d) { return Math.sqrt(d.value); });

    var node = svg.append("g")
        .attr("class", "nodes")
      .selectAll("circle")
      .data(d3graph.nodes)
      .enter().append("circle")
        .attr("r", 5)
        .attr("fill", function(d) { return color(d.group); })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));

    node.append("title")
        .text(function(d) { return d.id; });

    simulation
        .nodes(d3graph.nodes)
        .on("tick", ticked);

    simulation.force("link")
        .links(d3graph.links);

    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

    // });

  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }

  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

}
