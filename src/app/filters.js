'use strict';

// Filter to pretty print json
angular.module('supportAdminApp')
  .filter('prettyJSON', function () {
    return function (json) {
      return angular.toJson(json, true);
    };
  })
  .filter('capitalize', function () {
    return function (input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    };
  });
