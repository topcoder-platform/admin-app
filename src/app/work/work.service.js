'use strict';

angular.module('supportAdminApp')
  .factory('WorkService', ['$q', '$http', 'WORK_API_URL', '$log', 'API_VERSION_PATH',
      function($q, $http, WORK_API_URL, $log, API_VERSION_PATH) {

        var workStepNotFound = 'Project steps not found';
        var service = {
          getWorkSteps: getWorkSteps,
          findWorkById: findWorkById,
          putWorkStep: putWorkStep,
          workStepNotFound: workStepNotFound          
        };

        /**
         * putWorkStep update project step
         * @param  {string} workId   project id
         * @param  {string} stepId   project step id
         * @param  {object} stepItem step item object
         * @return {promise}         resolves to http put request
         */
        function putWorkStep(workId, stepId, stepItem) {
          console.log(["workId: ", workId, "stepId: ", stepId, stepItem]);
          if (!workId || !stepId) {
            return $q.reject({
              error: 'project ID and step ID must be specified.'
            });
          }
          var request = $http({
            method: 'PUT',
            url: WORK_API_URL +'/' + API_VERSION_PATH + '/work/' + workId + '/steps/' + stepId,
            headers: {
              "Content-Type": "application/json"
            },
            data: angular.toJson(stepItem)
          });
          return request.then(
            function(response) {
              console.log(response);
              if (_.isObject(response.data.result.content)) {
                return response.data.result.content;
              } else {
                return $q.reject("failed to update project step");
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
              error: 'project ID must be specified.'
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
                return $q.reject(workStepNotFound);
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
              error: 'project ID must be specified.'
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
              if (response.data && response.data.result && response.data.result.content) {
                return response.data.result.content;
              } else {
                console.log("project with '" + workId + "' not found.");
                return $q.reject({
                  error: "project with '" + workId + "' not found."
                });
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
