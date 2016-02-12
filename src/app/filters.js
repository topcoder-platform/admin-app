'use strict';

//Filter to pretty print json
angular.module('supportAdminApp')
  .filter('prettyJSON', function() {
    return function(json) {
      return angular.toJson(json, true);
    }
  });
