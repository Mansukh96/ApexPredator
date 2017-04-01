   width = $("#frequent_terms").width() -20;
   height = $("#frequent_terms").height() - 20;

   var cluster_color = d3.scale.ordinal()
		.range(['#006a89','#009eb4', '#00b6ba','#00dfa1','#00ff78']);

   var sideinfo_source = d3.select("#side_info_frequent_words")
	    .style("opacity", 0.5);

	cluster_svg = d3.select("#frequent_terms").append("svg")
		.attr("width", width)
		.attr("height", height);

	var tooltip_cluster = d3.tip()
	  .attr('class', 'd3-tip')
	  .offset([-10, 0])
	  .html(function(d) {
		return "Word: <span style= 'font-weight:400;font-size:1.2em;color:#00b6ba'> "+d.cluster+"</span><br />Rel Freq: <span style= 'font-weight:400;font-size:1.2em;color:#00ff78'> "+d.frequency.toString()+"</span>";
	  })
		//cluster_svg.call(tooltip_cluster);

normal_data= [];

function actual_draw_clusters(data, isInternal){
		cluster_svg.selectAll("*").remove();
	 	maximum = d3.max(data, function(d) { return +d.frequency; });
	 	minimum = d3.min(data, function(d) { return +d.frequency; });
		mR = 200;
		maxRadius = 900;
		resize = false;
		if(maximum < 871){
			resize = true;
		}

		if(resize){
			maxRadius = mR * 871/maximum;
		}


		var nodes = data.map(function (item) {
				var i = item['cluster'],
					r = +item['frequency'], // note the + to convert to number here.
					d = {
					  cluster: i,
					  frequency: r,
					  value : r * mR/100,
					  radius: r * maxRadius/100,
					  x: Math.cos(i / 30 * 2 * Math.PI) * 200 + width / 2 + Math.random(),
					  y: Math.sin(i / 30 * 2 * Math.PI) * 200 + height / 2 + Math.random()
					};
				if (!clusters[i] || (r > clusters[i].radius)) {
					clusters[i] = d;
				}
				return d;
			});
		
			var force = d3.layout.force()
			.nodes(nodes)
			.size([width, height])
			.gravity(0.1)
			.charge(1)
			.on("tick", tick)
			.start();

		force.start();
		
		var node = cluster_svg.selectAll("circle")
			.data(nodes);
			
		  node.enter().append("circle")
		  	.style("fill", function(d, i) { return cluster_color(i) })
			.attr("class", "circles");
		
		  node.call(force.drag);
		

		node.transition()
			.duration(750)
			.delay(function(d, i) { return i * 5; })
			.attrTween("r", function(d) {
			  var i = d3.interpolate(0, d.radius);
			  return function(t) { return d.radius = i(t); };
			});

		
		if(isInternal){
			node.on('click', function(d,i) {
					sideinfo_source.transition().duration(300).style("opacity", .9);
					sideinfo_source.html("<h3>More Infomation:</h3><h4>" + d.cluster+ "</h4><p>Mentions: <span style = 'color: #73879C; font-weight: 700';><strong>" + 
					d.frequency + "</strong></span></p>");
				});
		}
		else{
			node.on('click', function(d,i){
				drawClusters(true, d.cluster);
				$("#topic-sec-heading")[0].innerHTML += (" : <span style = 'color: #293742; font-size: 17px;'>" + d.cluster) ;
			});
		}
		node.on('mouseover',tooltip_cluster.show)
			  .on('mouseout', tooltip_cluster.hide);
		
		var label = cluster_svg.selectAll(".mytext")
							.data(nodes);
					
		label.enter()
				.append("text")
				.text(function (d) { return d.cluster.substring(0, d.radius / 3); })
				.style("text-anchor", "middle")
				.style("fill", "#333")
				.style("font-family", "Arial")
				.style("font-size", "0.75em");


		 node
	    .exit().remove();


	function tick(e) {
	  node
	      .each(cluster(10 * e.alpha * e.alpha))
	      .each(collide(.5))
	      .attr("cx", function(d) { return d.x; })
	      .attr("cy", function(d) { return d.y; });
	  label.attr("x", function(d) { return d.x; })
			  .attr("y", function(d) { return d.y; });
	}

	// Move d to be adjacent to the cluster node.
	function cluster(alpha) {
	  return function(d) {
	    var cluster = clusters[d.cluster];
	    if (cluster === d) return;
	    var x = d.x - cluster.x,
	        y = d.y - cluster.y,
	        l = Math.sqrt(x * x + y * y),
	        r = d.radius + cluster.radius;
	    if (l != r) {
	      l = (l - r) / l * alpha;
	      d.x -= x *= l;
	      d.y -= y *= l;
	      cluster.x += x;
	      cluster.y += y;
	    }
	  };
	}

	// Resolves collisions between d and all other circles.
	function collide(alpha) {
	  var quadtree = d3.geom.quadtree(nodes);
	  return function(d) {
	    var r = d.radius + maxRadius + Math.max(padding, clusterPadding),
	        nx1 = d.x - r,
	        nx2 = d.x + r,
	        ny1 = d.y - r,
	        ny2 = d.y + r;
	    quadtree.visit(function(quad, x1, y1, x2, y2) {
	      if (quad.point && (quad.point !== d)) {
	        var x = d.x - quad.point.x,
	            y = d.y - quad.point.y,
	            l = Math.sqrt(x * x + y * y),
	            r = d.radius + quad.point.radius + (d.cluster === quad.point.cluster ? padding : clusterPadding);
	        if (l < r) {
	          l = (l - r) / l * alpha;
	          d.x -= x *= l;
	          d.y -= y *= l;
	          quad.point.x += x;
	          quad.point.y += y;
	        }
	      }
	      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	    });
	  };
	}
}

/*function getAvg(){
	return minimum;
}*/
