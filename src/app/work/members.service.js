//******************************************************************************
// Handles querying of member data from ElasticSearch.
// (C) 2016 TopCoder. All Rights Reserved.

'use strict';

angular.module('supportAdminApp')
.factory('MembersService', ['$log', '$q', '$http', '$timeout',
         'ES_PROJECT_API_URL', 'API_VERSION_PATH',
         function($log, $q, $http, $timeout,
                  ES_PROJECT_API_URL, API_VERSION_PATH){

  var MembersService = {};

  /**
   * Generates a valid search query for the 'search' function of this service.
   * @param {Array} userIds An array of user IDs to be included into the search
   *                        query.
   * @return {Object} The query object which can be passed into the 'search'
   *                  function.
   */
  MembersService.generateSearchQuery = function(userIds) {
    var query = userIds.reduce(function(query, id) {
      if (!isNaN(id)) query += 'userId:' + id + ' OR ';
      return query;
    }, '').slice(0,-4);
    return { search: query };
  };

  /**
   * Searches members with 'userId' from the provided array.
   * @param {{
   *   search: string}} query query criteria
   * @return {Promise} Promise that resolves to the found members.
   */
  MembersService.search = function(query) {
    
    var deferred = $q.defer();
    var request = $http({
      method: 'GET',
      url: ES_PROJECT_API_URL + '/' + API_VERSION_PATH +
           '/members/_search?query=' + encodeURIComponent(query.search)
    });
    $timeout(function() {
      request.then(function(response) {
        deferred.resolve(response.data.result.content);
      }, function(error) {
        var err;
        if (error && error.data && error.data.result) {
          err = {
            status: error.status,
            error: error.data.result.content
          };
        }
        if (!err) {
          err = {
            status: error.status,
            error: error.statusText
          };
        }
        return deferred.reject(err);
      });
    }, 1);
    return deferred.promise;
  };

  return MembersService;

}]);
            

