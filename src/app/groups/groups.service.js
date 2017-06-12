'use strict';

angular.module('supportAdminApp')
  .factory('GroupService', [
             '$log', '$q','$http', 'API_URL', 'API_VERSION_PATH',
    function ($log, $q, $http, API_URL, API_VERSION_PATH) {

      var GroupService = {};

      /**
       * Get a list of all the groups
       *
       * @return {Promise} promise to fetch group list
       */
      GroupService.fetch = function() {
        return $http({
          method: 'GET',
          url: GroupService.getBasePath() + '/groups',
          headers: {
            "Content-Type": "application/json"
          }
        }).then(function (response) {
          if (response && response.data) {
            return response.data.result || [];
          } else {
            return $q.reject({
              error : 'Cannot find data in response'
            })
          }
        }).catch(GroupService.handleError);
      };

      /**
       * Get a group by its id
       * @param  {String}  id      group id to find
       * @param  {Array}   fields  fields of group to populate in response
       * @return {Promise}         promise get a group
       */
      GroupService.findById = function(groupId, fields) {
        return $http({
          method: 'GET',
          url: GroupService.getBasePath() + '/groups/' + groupId + (fields ? '?fields=' + fields.join(',') : ''),
          headers: {
            "Content-Type": "application/json"
          }
        }).then(function (response) {
          if (response && response.data && response.data.result) {
            return response.data.result.content;
          } else {
            return $q.reject({
              error : 'Cannot find data in response'
            })
          }
        }).catch(GroupService.handleError);
      };

      /**
       * Handle API response error
       *
       * @param  {Error}   error    the error as received in catch callback
       * @return {Promise}          rejected promise with error
       */
      GroupService.handleError = function(error) {
        var err;

        $log.error(error);

        if (error && error.data) {
          err = {
            status: error.status,
            error : error.data.result.content
          };
        }

        if (!err) {
          err = {
            status: error.status,
            error : error.message
          };
        }

        return $q.reject(err);
      }

      /**
       * Get base API path
       *
       * @return {String} base path
       */
      GroupService.getBasePath = function () {
        return API_URL + '/' + API_VERSION_PATH;
      }

      return GroupService;
    }]);
