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
       * Get a groups of the particular member
       *
       * @param  {String}  memberId        member id
       * @param  {String}  membershipType  membership type: 'user' or 'group'
       * @return {Promise}                 promise get a members group list
       */
      GroupService.findByMember = function(memberId, membershipType) {
        return $http({
          method: 'GET',
          url: GroupService.getBasePath() + '/groups/?memberId=' + memberId + '&membershipType=' + membershipType,
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
       * Creates a group
       * @param {Object} group The group.
       */
      GroupService.create = function(group) {
        var request = $http({
          method: 'POST',
          url: GroupService.getBasePath() + '/groups',
          headers: {
            "Content-Type":"application/json"
          },
          data: JSON.stringify({ param: group })
        });

        return request.then(
          function(response) {
            if (response && response.data && response.data.result) {
              var newGroup = response.data.result.content;
              var securityGroup = {id: newGroup.id, name: newGroup.name};
              return GroupService.createSecurityGroup(securityGroup)
                .then(function(response){}, GroupService.handleError);
            } else {
              return $q.reject({
                error : 'Cannot find data in response'
              })
            }
          },
          GroupService.handleError
        );
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
            "Content-Type":"application/json"
          },
          data: JSON.stringify({ param: group })
        });

        return request.then(
          function(response) {
            if (response && response.data && response.data.result) {
              return response.data.result.content;
            } else {
              return $q.reject({
                error : 'Cannot find data in response'
              })
            }
          },
          GroupService.handleError
        );
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
