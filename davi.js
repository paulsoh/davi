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
  slice.on("mouseover", function(d, i) { renderHistogram(sum_money[i], i); });

//function setHistogram(){
//    // A formatter for counts.
//    var formatCount = d3.format(",.0f");

//    var margin = {top: 10, right: 30, bottom: 30, left: 30},
//        width = 960 - margin.left - margin.right,
//        height = 500 - margin.top - margin.bottom;

//    var x = d3.scale.linear()
//        .domain([100000, 1000000])
//        .range([0, width]);

//    // Generate a histogram using twenty uniformly-spaced bins.
//    var data = d3.layout.histogram().bins(x.ticks(50))
//        (dataset);

//    var y = d3.scale.linear()
//        .domain([0, d3.max(data, function(d) { return d.y; })])
//        .range([height, 0]);

//    var xAxis = d3.svg.axis()
//        .scale(x)
//        .orient("bottom");

//    var svg = d3.select("body").append("svg")
//        .attr("width", width + margin.left + margin.right)
//        .attr("height", height + margin.top + margin.bottom)
//      .append("g")
//        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

//    var bar = svg.selectAll(".bar")
//        .data(data)
//      .enter().append("g")
//        .attr("class", "bar")
//        .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });

//    bar.append("rect")
//        .attr("x", 1)
//        .attr("width", x(100000+data[0].dx) - 1)
//        .attr("height", function(d) { return height - y(d.y); });

//    bar.append("text")
//        .attr("dy", ".75em")
//        .attr("y", -10)
//        .attr("x", x(100000+data[0].dx) / 2)
//        .attr("text-anchor", "middle")
//        .text(function(d) { return formatCount(d.y); });

//    svg.append("g")
//        .attr("class", "x axis")
//        .attr("transform", "translate(0," + height + ")")
//        .call(xAxis);
//}

  // histogram_data set up
  var svg = d3.select("#histogram")
              .append("svg")
              .append("g")
              .attr("width", width)
              .attr("height", height);

  svg.append("g").attr("class", "histogram");
    
  function renderHistogram(data, i) {

    var money_data = data.map( function(d) { return d.rounded_money; });

    var x_range = [];
    if (i === 0) {
      x_range = [0, breakpoints[i]];
    } else if (i === breakpoints.length) {
      x_range = [breakpoints[i-1], 2000000];
    } else {
      x_range = [breakpoints[i-1], breakpoints[i]];
    }

    var x = d3.scale.linear()
              .domain(x_range)
              .range([0, width]);

    var histogram_data = d3.layout.histogram()
                           .bins(x.ticks(20))
                           ( money_data );

    var y = d3.scale.linear()
        .domain([0, d3.max(histogram_data, function(d) { return d.y; })])
        .range([height, 0]);

    var xAxis = d3.svg.axis()
        .scale(x)
        .orient("bottom");

    var bar = svg.selectAll(".bar")
                 .data(histogram_data)
                 .enter().append("g")
                 .attr("class", "bar")
                 .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; })
                  
                 //.data(histogram_data)
                 //.enter().append("g")
                 //.attr("class", "bar") 
                 //.attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; })

    console.log(histogram_data)

    bar.append("rect")
        .attr("x", 1)
        .attr("width", x(breakpoints[i-1] + histogram_data[0].dx) - 1)
        .attr("height", function(d) { return height - y(d.length); })
        .attr("fill", "blue");

    //bar.exit()
    //   .remove();
  }
});
