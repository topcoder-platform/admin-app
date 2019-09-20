'use strict';

angular.module('supportAdminApp').factory('GroupMemberService', [
  '$log',
  '$q',
  '$http',
  'GROUP_V5_API_URL',
  function($log, $q, $http, GROUP_V5_API_URL) {
    var GroupMemberService = {};

    /**
     * Get a list of all the groups
     *
     * @param {String} groupId group id
     * @param {Object} params query params
     */
    GroupMemberService.fetch = function(groupId, params) {
      return $http({
        method: 'GET',
        url: GroupMemberService.getBasePath() + '/groups/' + groupId + '/members',
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
        .catch(GroupMemberService.handleError);
    };

    /**
     * Add a member to the group specified by id
     *
     * @param {String} groupId group id
     * @param {Object} entity  membership entity to add, contains memberId and membershipType
     * @return {Promise}       promise to add a member
     */
    GroupMemberService.addMember = function(groupId, entity) {
      return $http({
        method: 'POST',
        url: GroupMemberService.getBasePath() + '/groups/' + groupId + '/members',
        data: {
          param: entity
        },
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(function(response) {
          if (response) {
            return response;
          } else {
            return $q.reject({
              error: 'Cannot find data in response'
            });
          }
        })
        .catch(GroupMemberService.handleError);
    };

    /**
     * Remove a member from the group
     *
     * @param  {String} groupId      group id
     * @param  {String} memberId     member id
     * @return {Promise}             promise to remove a member
     */
    GroupMemberService.removeMember = function(groupId, memberId) {
      return $http({
        method: 'DELETE',
        url: GroupMemberService.getBasePath() + '/groups/' + groupId + '/members/' + memberId,
        headers: {
          'Content-Type': 'application/json'
        }
      })
        .then(function(response) {
          return response;
        })
        .catch(GroupMemberService.handleError);
    };

    /**
     * Handle API response error
     *
     * @param  {Error}   error    the error as received in catch callback
     * @return {Promise}          rejected promise with error
     */
    GroupMemberService.handleError = function(error) {
      var err;

      $log.error(error);

      if (error && error.data && error.data.result && error.data.result.content) {
        err = {
          status: error.status,
          error: error.data.result.content
        };
      } else if (error && error.data && error.data.message) {
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
    GroupMemberService.getBasePath = function() {
      return GROUP_V5_API_URL;
    };

    return GroupMemberService;
  }
]);
