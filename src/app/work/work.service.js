'use strict';

angular.module('supportAdminApp')
  .factory('WorkService', ['$q', '$http', 'API_URL', '$log', 'API_VERSION_PATH',
      function($q, $http, API_URL, $log, API_VERSION_PATH) {

        var service = {
          getWorkSteps: getWorkSteps,
          findworkById: findworkById,
          findWorks: findWorks,
          getUserByHandle: getUserByHandle
        }

        /**
         * helper function to process http request
         */
        var _processRequest = function(request) {
          return request.then(
            function(response) {
              return response.data.result.content;
            },
            function(error) {
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
              return $q.reject(err);
            }
          );
        };

        return service;
        /**
         * retrieve work steps
         */
        function getWorkSteps(workId) {
          if (!workId) {
            return $q.reject({
              error: 'work ID must be specified.'
            });
          }
          var request = $http({
            method: 'GET',
            url: API_URL +'/' + API_VERSION_PATH + '/work/' + workId + '/steps/',
            headers: {
              "Content-Type": "application/json"
            }
          });
          return request.then(
            function(response) {
              if (Array.isArray(response.data.result.content) && response.data.result.content.length > 0) {
                var steps = [];
                _(response.data.result.content).forEach(function(p) {
                  steps.push(p);
                });
                return steps;

              } else {
                return $q.reject("work steps not found");
              }
            },
            function(error) {
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
              return $q.reject(err);
            }
          );
        };
        /**
         * Find work identified by work Id
         */
        function findworkById(workId) {
          if (!workId) {
            return $q.reject({
              error: 'work ID must be specified.'
            });
          }
          var request = $http({
            method: 'GET',
            url: API_URL +'/' + API_VERSION_PATH + '/work/' + workId,
            headers: {
              "Content-Type": "application/json"
            }
          });
          return request.then(
            function(response) {
              if (Array.isArray(response.data.result.content) && response.data.result.content.length > 0) {
                return response.data.result.content[0];
              } else {
                return $q.reject("work with '" + workId + "' not found.");
              }
            },
            function(error) {
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
              return $q.reject(err);
            }
          );
        };

        /** 
         * Find all Work associated with work identified
         * by work Id
         */
        function findWorks(workId) {
          if (!workId) {
            return $q.reject({
              error: 'work ID must be specified.'
            });
          }
          var filterParams = encodeURIComponent('reference={"type":"work","id":"' + workId + '"}');

          var request = $http({
            method: 'GET',
            url: API_URL + '/v3/Works/?filter=' + filterParams,
            headers: {
              "Content-Type": "application/json"
            }
          });
          return _processRequest(request);
        };
        /** 
         * Fetches the user details identified by a user Handle
         * 
         */
        function getUserByHandle(userHandle) {
          var request = $http({
            method: 'GET',
            url: API_URL + '/v3/members/' + userHandle,
            headers: {
              "Content-Type": "application/json"
            }
          });
          return _processRequest(request);
        };
  }
]);
