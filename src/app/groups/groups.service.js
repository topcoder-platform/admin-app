'use strict';

angular.module('supportAdminApp').factory('GroupService', [
  '$log',
  '$q',
  '$http',
  'GROUP_V5_API_URL',
  function($log, $q, $http, GROUP_V5_API_URL) {
    var GroupService = {};

    /**
     * Get a list of all the groups
     * @param  {Object}  params  query params
     * @return {Promise} promise to fetch group list
     */
    GroupService.fetch = function(params) {
      return $http({
        method: 'GET',
        url: GroupService.getBasePath() + '/groups',
        headers: {
          'Content-Type': 'application/json'
        },
        params: params
      })
        .then(function(response) {
          if (response && response.data) {
            return response.data || [];
          } else {
            return $q.reject({
              error: 'Cannot find data in response'
            });
          }
        })
        .catch(GroupService.handleError);
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
          'Content-Type': 'application/json'
        }
      })
        .then(function(response) {
          if (response && response.data) {
            return response.data;
          } else {
            return $q.reject({
              error: 'Cannot find data in response'
            });
          }
        })
        .catch(GroupService.handleError);
    };

    /**
     * Get a groups of the particular member
     *
     * @param  {Object}  params          query params
     * @return {Promise}                 promise get a members group list
     */
    GroupService.findByMember = function(params) {
      return $http({
        method: 'GET',
        url: GroupService.getBasePath() + '/groups',
        headers: {
          'Content-Type': 'application/json'
        },
        params: params
      })
        .then(function(response) {
          if (response && response.data) {
            return response.data;
          } else {
            return $q.reject({
              error: 'Cannot find data in response'
            });
          }
        })
        .catch(GroupService.handleError);
    };

    /**
     * Creates a group
     * @param {Object} group The group.
     */
    GroupService.create = function(group) {
      var request = $http({
        method: 'POST',
        url: GroupService.getBasePath() + '/groups',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify(group)
      });

      return request.then(function(response) {
        if (response && response.data && response.data) {
          return response.data;
        } else {
          return $q.reject({
            error: 'Cannot find data in response'
          });
        }
      }, GroupService.handleError);
    };

    /**
     * Creates a security group
     * @param {Object} group The security group.
     */
    GroupService.createSecurityGroup = function(group) {
      var request = $http({
        method: 'POST',
        url: GroupService.getBasePath() + '/groups/securityGroups',
        headers: {
          'Content-Type': 'application/json'
        },
        data: JSON.stringify({ param: group })
      });

      return request.then(function(response) {
        if (response && response.data && response.data.result) {
          return response.data.result.content;
        } else {
          return $q.reject({
            error: 'Cannot find data in response'
          });
        }
      }, GroupService.handleError);
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
          error: error.data.message
        };
      }

      if (!err) {
        err = {
          status: error.status,
          error: error.message
        };
      }

      return $q.reject(err);
    };

    /**
     * Get base API path
     *
     * @return {String} base path
     */
    GroupService.getBasePath = function() {
      return GROUP_V5_API_URL;
    };

    return GroupService;
  }
]);
