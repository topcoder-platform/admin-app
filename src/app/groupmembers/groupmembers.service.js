'use strict';

angular.module('supportAdminApp')
  .factory('GroupMemberService', ['$log', '$q','$http', 'API_URL', 'API_VERSION_PATH',
    function ($log, $q, $http, API_URL, API_VERSION_PATH) {

      var GroupMemberService = {};

      /**
       * Get a list of all the groups
       *
       * @param {String} groupId group id
       */
      GroupMemberService.fetch = function(groupId) {
        return $http({
          method: 'GET',
          url: GroupMemberService.getBasePath() + '/groups/' + groupId + '/members',
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
        }).catch(GroupMemberService.handleError);
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
        }).then(function (response) {
          if (response && response.data && response.data.result) {
            return response.data.result.content;
          } else {
            return $q.reject({
              error : 'Cannot find data in response'
            })
          }
        }).catch(GroupMemberService.handleError);
      }

      /**
       * Remove a member from the group
       *
       * @param  {String} groupId      group id
       * @param  {String} membershipId membership id
       * @return {Promise}             promise to remove a member
       */
      GroupMemberService.removeMember = function(groupId, membershipId) {
        return $http({
          method: 'DELETE',
          url: GroupMemberService.getBasePath() + '/groups/' + groupId + '/members/' + membershipId,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function(response) {
          return response;
        }).catch(GroupMemberService.handleError);
      }

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
            error : error.data.result.content
          };
        } else if (error && error.data && error.data.message) {
          err = {
            status: error.status,
            error : error.data.message
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
      GroupMemberService.getBasePath = function () {
        return API_URL + '/' + API_VERSION_PATH;
      }

      return GroupMemberService;
    }]);
