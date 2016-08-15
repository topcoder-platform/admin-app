/**
 * The Project Service provides functions to search projects in
 * the database. 
 *
 * (C) TopCoder. All Rights Reserved.
 */

'use strict';

angular.module('supportAdminApp')
  .factory('ProjectService', ['$log', '$q', '$http', 'API_VERSION_PATH', 'ES_PROJECT_API_URL', 'WorkService', '$timeout', 'WORK_API_URL',
    function ($log, $q, $http, API_VERSION_PATH, ES_PROJECT_API_URL, workSvc, $timeout, WORK_API_URL) {

      var ProjectService = {
        findProjectById: findProjectById
      };

      /**
       * search search projects by querying lambda function
       * @param  {{
       *   search: string,
       *   status: string }} query  query criteria
       * @return {promise}          promise that resolves to found projects
       */
      ProjectService.search = function (query) {
        var deferred = $q.defer();
        var request = $http({
          method: 'GET',
          url: ES_PROJECT_API_URL + '/' + API_VERSION_PATH +
               '/projects/_search?query=' + encodeURIComponent(query.search) +
               '&status=' + encodeURIComponent(query.status)
        });

        $timeout(function () {
          request.then(function (response) {
            // attach work steps
            deferred.resolve(attachWorkSteps(response.data.result.content));
          }, function (error) {
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
          }
          );
        }, 1);

        return deferred.promise;
      };

      /**
       * attachWorkSteps attach work step items to work(project)
       * @param  {array} projects  array of projects
       * @return {promise}         promise that resolves to array of projects with work steps attached
       */
      function attachWorkSteps(projects) {
        var promises = $.map(projects, function (proj) {
          var deferred = $q.defer();

          workSvc.getWorkSteps(proj.id)
            .then(function (steps) {
              // find current step by lookup with step status
              var currentStep = _.find(steps, function (step) {
                return step.status.toLowerCase() === 'in progress';
              });

              if (currentStep) {
                proj.currentStep = currentStep.stepType; // attach current work step
              }
              deferred.resolve(); // continue promise chain.
            })
            .catch(function (err) {
              if (err === workSvc.workStepNotFound) { // not an error, just no work steps found
                proj.currentStep = 'N/A'; // placeholder value for projects with no work steps
                deferred.resolve();      // continue promise chain.
              } else {
                // an error, reject the promise that error can be handled in controller
                deferred.reject('cannot fetch work step for project id: ' + proj.id);
              }
            });

          return deferred.promise;
        });

        return $q.all(promises)
          .then(function () {
            return projects;
          });
      }

      /**
       * findProjectById finds the project identified by 'projectId'.
       * @param {String} projectId the project's ID.
       * @return {promise} promise that resolves to the found project.
       */
      function findProjectById(projectId) {
        
        if (!projectId) {
          return $q.reject({
            error: 'Project ID must be specified!'
          });
        }

        var request = $http({
          method: 'GET',
          url: WORK_API_URL + '/' + API_VERSION_PATH + '/projects/' + projectId,
          headers: {
            'Content-Type': 'application/json'
          }
        });
       
        return request.then(
          function(response) {
            if (response.data && response.data.result &&
                response.data.result.content) {
              return response.data.result.content;
            } else {
              var errStr = 'Project with ID ' + projectId + ' not found!';
              console.log(errStr);
              return $q.reject({ error: errStr });
            }
          },
          function(error) {
            var errStr = error && error.data && error.data.result ?
                         error.data.result.content : error.statusText;
            return $q.reject({
              status: error.status,
              error: errStr
            });
          }
        );
      };

      return ProjectService;
    }]);
