var breakpoints = [10000, 30000, 100000];
var sum_money = [];
var sum_count = [];
var labels = [];

function initializeArrays() {
  for(var i=0; i < breakpoints.length+1; i++) {
    sum_money.push(0);
    sum_count.push(0);
  }
}

function generateLabels() {
  // breakpoints = [10000, 50000, 120000]
  // labels = ['~10000', '10000~50000', '50000~120000', '120000~']
  for(var i=0; i < breakpoints.length+1; i++) {
    if (i === 0) {
      labels.push('~'+breakpoints[i] + "원");
    } else if (i === breakpoints.length) {
      labels.push(breakpoints[i-1]+'~' + "원");
    } else {
      labels.push(breakpoints[i-1]+'~'+breakpoints[i] + "원");
    }
  }
}

d3.json('new_project_full_data.json', function(data) {

  initializeArrays();
  generateLabels();

  for (var i=0; i < breakpoints.length+1; i++) {
    // [10000, 30000, 100000]
    // 0, 1, 2, 3
    // data < 10000, 10000<= data < 30000, 30000 <= data < 100000, 100000 <= data
    if (i === 0) {
      sum_money[i] = data.filter(function(d) { 
        return d.rounded_money < breakpoints[i] 
      });
      sum_count[i] = sum_money[i].length; 
    } else if (i === breakpoints.length) {
      sum_money[i] = data.filter(function(d) { 
        return breakpoints[i-1] <= d.rounded_money 
      });
      sum_count[i] = sum_money[i].length; 
    } else {
      sum_money[i] = data.filter(function(d) { 
        return breakpoints[i-1] <= d.rounded_money 
               && d.rounded_money < breakpoints[i]
      });
      sum_count[i] = sum_money[i].length; 
    }
  }

  var width = 960;
  var height = 480;
  var radius = Math.min(width, height) / 2;

  var svg = d3.select("#pieChart")
              .append("svg")
              .append("g")

  svg.append("g").attr("class", "slices");
  svg.append("g").attr("class", "labels");
  svg.append("g").attr("class", "lines");

  svg.attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

  var pie = d3.layout.pie()
              .sort(null)
              .value(function(d){return d;});

  
  var arc = d3.svg.arc()
              .outerRadius(radius * 0.8)
              .innerRadius(radius * 0.4);

  var outerArc = d3.svg.arc()
              .innerRadius(radius * 0.9)
              .outerRadius(radius * 0.9);

  var color = d3.scale.ordinal()
                .domain(labels)
                // TODO: add color generator
                .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b"]);

  var key = function(d, i) { return labels[i]; }

  // Pie slices
  var slice = svg.select(".slices").selectAll("path.slice")
                 .data(pie(sum_count), key)

  slice.enter()
       .insert("path")
       .style("fill", function(d, i) { return color(labels[i]); })
       .attr("class", "slice")
       .attr("d", arc);

  // Pie labels
  function midAngle(d) {
    return d.startAngle + (d.endAngle - d.startAngle)/2;
  }

  var text = svg.select(".labels").selectAll("text")
                .data(pie(sum_count), key);

  text.enter()
    .append("text")
    .attr("dy", "0.5em")
    .text(function(d, i) { console.log(d); return labels[i] })
    .attr("transform", function (d) { 
      var pos = outerArc.centroid(d);
      pos[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
      return "translate(" + pos +")"
    })
    .attr("text-anchor", function(d) { return midAngle(d) > Math.PI ? "end": "start"; })

  // Slice to text line
  var polyline = svg.select(".lines").selectAll("polyline")
		.data(pie(sum_count), key);
	
	polyline.enter()
		      .append("polyline")
          .attr("points", function(d) { 
            var pos = outerArc.centroid(d);
            pos[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
            return [arc.centroid(d), outerArc.centroid(d), pos];
          });

  // Mouse hover
  slice.on("mouseover", function(d) { console.log(d) });
});
