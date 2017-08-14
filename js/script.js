'use strict';

var reader = new FileReader();  
    
function loadFile() {      
  var file = document.querySelector('input[type=file]').files[0];      
  reader.addEventListener("load", function() {
    var ar = reader.result;
    var arrayLines = ar.split('\n');
    var headers = arrayLines[0].split(',');
    var tableHeader = document.querySelector('#contentTable thead tr');
    var tableBody = document.querySelector('#contentTable tbody');
    var tableBodyContent = '';

    /* create header */
    for(var h = 0; h < headers.length; h++) {
      tableHeader.innerHTML += '<td>' + headers[h] + '</td>';
    }

    /* create body + obj */
    for(var i = 1; i < arrayLines.length; i++) {
      var obj = {};
      var data = arrayLines[i].split('\,');
      
      /* obj */
      for(var j = 0; j < data.length; j++) {
        obj[myTrim(headers[j])] = myTrim(data[j]);
      }

      /* table */
      tableBodyContent += '<tr>';
      for(var t = 0; t < data.length; t++) {
        tableBodyContent += '<td>' + myTrim(data[t]) + '</td>';
      }
      tableBodyContent += '</tr>';
    }
    
    tableBody.innerHTML = tableBodyContent;
  }, false);
  reader.readAsBinaryString(file);     
}


function myTrim(x) {
  x.replace(/^\s+|\s+$/gm,'');
  var trimVal = parseFloat(x);
  if(isNaN(trimVal)) {
    return x;
  } else {
    return trimVal;
  }
}
