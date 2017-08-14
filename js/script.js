'use strict';
function handleFileSelect(evt) {
  var file = evt.target.files[0];
  var reader = new FileReader();
  reader.onload = (function(theFile) {
    return function(e) {

      /* print the data as a table */
      var openFile = new XMLHttpRequest();
      openFile.open('GET', e.target.result, true);
      openFile.responseType = 'text';
      openFile.onload = function() {
        if(openFile.status === 200) {
          var obj = {};
          var jsonObj = [];
          var ar = openFile.response;
          var arrayLines = ar.split('\n');
          var headers = arrayLines[0].split(',');
          var tableHeader = document.querySelector('#contentTable thead tr');
          var tableBody = document.querySelector('#contentTable tbody');
          var tableBodyContent = '';

          /* table - create header */
          for(var h = 0; h < headers.length; h++) {
            tableHeader.innerHTML += '<td>' + headers[h] + '</td>';
          }

          /* table - create body */
          for(var i = 1; i < (arrayLines.length - 1); i++) {
            var data = arrayLines[i].split('\,');
            tableBodyContent += '<tr>';
            for(var t = 0; t < data.length; t++) {
              tableBodyContent += '<td>' + myTrim(data[t]) + '</td>';
            }
            tableBodyContent += '</tr>';
          }
          tableBody.innerHTML = tableBodyContent;
        }
      }
      openFile.send();


      /* send link to draw the charts */
      drawChart(e.target.result);
      drawBar(e.target.result);
    };
  })(file);

  reader.readAsDataURL(file);
}
/* trim empty spaces */
function myTrim(x) {
  x.replace(/^\s+|\s+$/gm,'');
  var trimVal = parseFloat(x);
  if(isNaN(trimVal)) {
    return x;
  } else {
    return trimVal;
  }
}

document.getElementById('file_input').addEventListener('change', handleFileSelect, false);

/* draw pie chart */
function drawChart(url) {
  var width = 360;
  var height = 420;
  var radius = Math.min(width, height) / 2;
  var donutWidth = 75;
  var legendRectSize = 18;
  var legendSpacing = 4;
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  var svg = d3.select('#chart')
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .append('g')
    .attr('transform', 'translate(' + (width / 2) +
      ',' + (height / 2) + ')');

  svg.append('text')
    .attr("y", (-height/2) + 20)
    .attr("text-anchor", "middle") 
    .text('Land Area')
    .style("font-size", "20px") 
    .style('fill', '#fff');

  var arc = d3.arc()
    .innerRadius(radius - donutWidth)
    .outerRadius(radius);

  var pie = d3.pie()
    .value(function(d) {
      return d.LandArea;
    })
    .sort(null);
    

  d3.csv(url, function(error, dataset) {
    dataset.forEach(function(d) {
      d.LandArea = +d.LandArea;
    });

    var path = svg.selectAll('path')
      .data(pie(dataset))
      .enter()
      .append('path')
      .attr('d', arc)
      .attr('fill', function(d, i) {
        return color(i);
      });
    var legend = svg.selectAll('.legend')
      .data(dataset)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', function(d, i) {
        var height = legendRectSize + legendSpacing;
        var offset = height * color(d).length / 2;
        var horz = -2 * legendRectSize;
        var vert = i * height - offset;
        return 'translate(' + horz + ',' + vert + ')';
      });
    legend.append('rect')
      .attr('width', legendRectSize)
      .attr('height', legendRectSize)
      .style('fill', function(d, i) {
        return color(i);
      })
      .style('stroke', function(d, i) {
        return color(i);
      });
    legend.append('text')
      .attr('x', legendRectSize + legendSpacing)
      .attr('y', legendRectSize - legendSpacing)
      .text(function(d, i) {
        return d.City;
      })
      .style('fill', '#fff');
  });
}

function drawBar(url) {
  // set the dimensions and margins of the graph
  var margin = {top: 150, right: 20, bottom: 30, left: 40},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;
  var color = d3.scaleOrdinal(d3.schemeCategory10);
  // set the ranges
  var x = d3.scaleBand()
            .range([0, width])
            .padding(0.1);
  var y = d3.scaleLinear()
            .range([height, 0]);
            
  // append the svg object to the body of the page
  // append a 'group' element to 'svg'
  // moves the 'group' element to the top left margin
  var svg = d3.select("#bar").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", 
          "translate(" + margin.left + "," + margin.top + ")");

  svg.append('text')
    .attr("y", 0)
    .attr('x', width/2)
    .attr("text-anchor", "middle") 
    .text('Population (Millions)')
    .style("font-size", "20px") 
    .style('fill', '#fff');

  // get the data
  d3.csv(url, function(error, data) {
    if (error) throw error;

    // format the data
    data.forEach(function(d) {
      d.Population = +d.Population;
    });

    // Scale the range of the data in the domains
    x.domain(data.map(function(d) { return d.City; }));
    y.domain([0, d3.max(data, function(d) {
        return d.Population;
      })]);

    // append the rectangles for the bar chart
    svg.selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", function(d) { return x(d.City); })
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.Population); })
      .attr("height", function(d) { return height - y(d.Population); })
      .style('fill', function(d, i) {
        return color(i);
      });
    // add the x Axis
    svg.append("g")
        .attr("transform", "translate(0," + height + ")",)
        .call(d3.axisBottom(x));

    // add the y Axis
    svg.append("g")
        .call(d3.axisLeft(y));
  });
}






