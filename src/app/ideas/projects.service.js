'use strict';

angular
  .module('supportAdminApp')
  .factory('ProjectService', [
    '$log',
    '$http',
    'API_URL',
    'helper',
    function ($log, $http, API_URL, helper) {
      // of the API including version.
      var basePath = API_URL + '/v4';

      // The default headers.
      var defaultHeaders = {
        "Content-Type": "application/json"
      };

      var ProjectService = {};

      /**
       * Creates a new project
       * @param {Object} project The project
       * @param {Object} user The user
       * @returns {Object} The created project
       */
      ProjectService.createProject = function (project, user) {
        project.type = 'app';
        project.details = {
          products: ["application_development"],
          utm: {
            code: "spigit"
          },
          appDefinition: {
            primaryTarget: "desktop",
            goal: {
              value: "TBD"
            },
            users: {
              value: "Description of target users."
            },
            notes: user.first_name + ' ' + user.last_name + '-' + user.primary_email
          },
          hideDiscussions: true
        };

        var payload = JSON.stringify({param: project});
        var request = $http({
          method: 'POST',
          url: basePath + '/projects/',
          headers: defaultHeaders,
          data: payload
        });

        return request.then(function (response) {
          $log.debug(response);
          return response.data.result.content;
        }, helper.handleError);
      };

      /**
       * Add user to project.
       * @param {Integer} projectId The project id
       * @param {Integer} userId The user id
       * @returns {Object} The created project user
       */
      ProjectService.addUserToProject = function (projectId, userId) {
        var payload = JSON.stringify({
          param: {
            role: 'customer',
            userId: userId,
            isPrimary: true
          }
        });
        var request = $http({
          method: 'POST',
          url: basePath + '/projects/' + projectId + '/members',
          headers: defaultHeaders,
          data: payload
        });

        return request.then(function (response) {
          $log.debug(response);
          return response.data;
        }, helper.handleError);
      };

      return ProjectService;
    }
  ]);
