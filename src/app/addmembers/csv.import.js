'use strict';

var csvImport = angular.module('csvReader', []);

csvImport.directive('csvReader', [function () {

    // Function to convert to JSON
    var convertToJSON = function (content) {

        // Declare our variables
        var lines = content.csv.split(/\r|\n|\r\n/),
            headers = lines[0].split(content.separator),
            columnCount = lines[0].split(content.separator).length,
            results = [];

        // For each row
        for (var i = 1; i < lines.length; i++) {

          if(lines[i] != ''){
            // Declare an object
            var obj = {};

            // Get our current line
            var line = lines[i].split(new RegExp(content.separator + '(?![^"]*"(?:(?:[^"]*"){2})*[^"]*$)'));

            // For each header
            for (var j = 0; j < headers.length; j++) {

                // Populate our object
                obj[headers[j]] = line[j];
            }

            // Push our object to our result array
            results.push(obj);
          }
        }

        // Return our array
        return results;
    };

    return {
        restrict: 'A',
        scope: {
            results: '=',
            separator: '=',
            callback: '&'
        },
        link: function (scope, element, attrs) {

            // Create our data model
            var data = {
                csv: null,
                separator: scope.separator || ','
            };

            // When the file input changes
            element.on('change', function (e) {

                // Get our files
                var files = e.target.files;

                // If we have some files
                if (files && files.length) {

                    // Create our fileReader and get our file
                    var reader = new FileReader();
                    var file = (e.srcElement || e.target).files[0];

                    // Once the fileReader has loaded
                    reader.onload = function (e) {

                        // Get the contents of the reader
                        var contents = e.target.result;

                        // Set our contents to our data model
                        data.csv = contents;

                        // Apply to the scope
                        scope.$apply(function () {

                            // Our data after it has been converted to JSON
                            scope.results = convertToJSON(data);

                            // Call our callback function
                            scope.callback({inputJson: scope.results});
                        });
                    };

                    // Read our file contents
                    reader.readAsText(file);
                }
            });
        }
    };
}])