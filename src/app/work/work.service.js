'use strict';

angular.module('supportAdminApp')
  .factory('WorkService', ['$q', '$http', 'WORK_API_URL', '$log', 'API_VERSION_PATH',
      function($q, $http, WORK_API_URL, $log, API_VERSION_PATH) {

        var service = {
          getWorkSteps: getWorkSteps,
          findWorkById: findWorkById
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
            url: WORK_API_URL +'/' + API_VERSION_PATH + '/work/' + workId + '/steps/',
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
        function findWorkById(workId) {
          if (!workId) {
            return $q.reject({
              error: 'work ID must be specified.'
            });
          }
          var request = $http({
            method: 'GET',
            url: WORK_API_URL +'/' + API_VERSION_PATH + '/work/' + workId,
            headers: {
              "Content-Type": "application/json"
            }
          });
          return request.then(
            function(response) {
              if (Array.isArray(response.data.result.content) && response.data.result.content.length > 0) {
                return response.data.result;
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
  }
]);
