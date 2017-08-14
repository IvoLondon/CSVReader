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


      /* send link to draw the chart */
      drawChart(e.target.result);
    };
  })(file);

  reader.readAsDataURL(file);
}

document.getElementById('file_input').addEventListener('change', handleFileSelect, false);

/* draw pie chart */
function drawChart(url) {
  var width = 360;
  var height = 360;
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

