'use strict';

angular.module('supportAdminApp')
  .factory('ChallangeForumService', ['$q', '$http', 'FORUMS_API_ENDPOINT', 'FORUMS_API_TOKEN',
    function ($q, $http, FORUMS_API_ENDPOINT, FORUMS_API_TOKEN) {

      var service = {
        findVanillaGroupByChallengeId: findVanillaGroupByChallengeId,
        getVanillaGroupMembers: getVanillaGroupMembers,
        addUserToGroup: addUserToGroup,
        removeUserFromGroup: removeUserFromGroup,
        getRoles: getRoles,
        getUser: getUser,
        updateUserRoles: updateUserRoles,
        archiveGroup: archiveGroup,
        getUserByHandle: getUserByHandle,
        updateGroupWatch: updateGroupWatch,
        getGroupMemberDetails: getGroupMemberDetails,
        getComments: getComments
      }

      return service;

      /**
       * helper function to process error.
       * @param {Error} error 
       */
      function _handleError(error) {
        var err;
        if (error && error.data) {
          err = {
            status: error.status,
            message: error.data.message
          };
        }
        if (!err) {
          err = {
            status: error.status,
            message: error.statusText
          };
        }
        return $q.reject(err);
      }

      /**
       * Find vanilla group by challenge Id.
       * @param challengeId The challenge identity.
       * @returns {Promise} Promise with forum collection
       */
      function findVanillaGroupByChallengeId(challengeId) {
        if (!challengeId) {
          return $q.reject({
            error: 'Challenge ID must be specified.'
          });
        }

        var request = $http({
          method: 'GET',
          url: FORUMS_API_ENDPOINT + '/groups?challengeID=' + challengeId + '&access_token=' + FORUMS_API_TOKEN,
          headers: {
            "Content-Type": "application/json",
          }
        });
        return request.then(
          function (response) {
            if (response.data || response.data.length > 0) {
              return response.data;
            } else {
              var err;
              err = {
                status: 404,
              };
              return $q.reject(err);
            }
          },
          function (error) {
            return _handleError(error);
          }
        );
      };

      /**
       * Get vanilla forum members.
       * @param groupId The group identity
       * @returns {Promise} Promise with member collection
       */
      function getVanillaGroupMembers(groupId) {
        if (!groupId) {
          return $q.reject({
            error: 'Group ID must be specified.'
          });
        }

        var request = $http({
          method: 'GET',
          url: FORUMS_API_ENDPOINT + '/groups/' + groupId + '/members?access_token=' + FORUMS_API_TOKEN,
          headers: {
            "Content-Type": "application/json",
          }
        });
        return request.then(
          function (response) {
            if (response.data || response.data.length > 0) {
              return response.data;
            } else {
              var err;
              err = {
                status: 404,
              };
              return $q.reject(err);
            }
          },
          function (error) {
            return _handleError(error);
          }
        );
      };


      /**
       * Delete member from forum.
       * @param {number} userId the user identity.
       * @param {number} groupId the group identity.
       */
      function removeUserFromGroup(userId, groupId) {
        var request = $http({
          method: 'DELETE',
          url: FORUMS_API_ENDPOINT + '/groups/' + groupId + '/member/' + userId + '?access_token=' + FORUMS_API_TOKEN,
          headers: {
            "Content-Type": "application/json"
          }
        });
        return request.then(
          function (response) {
            if (response.data || response.data.length > 0) {
              return response.data;
            }
          },
          function (error) {
            return _handleError(error);
          }
        );
      };

      /**
       * Add member into forum
       * @param {object} data the data.
       * @param {number} groupId the group identity
       */
      function addUserToGroup(data, groupId) {
        var request = $http({
          method: 'POST',
          url: FORUMS_API_ENDPOINT + '/groups/' + groupId + '/members?access_token=' + FORUMS_API_TOKEN,
          headers: {
            "Content-Type": "application/json"
          },
          data: data
        });

        return request.then(
          function (response) {
            if (response.data || response.data.length > 0) {
              return response.data;
            }
          },
          function (error) {
            return _handleError(error);
          }
        );
      };

      /**
       * Update the watch for a forum member.
       * @param groupId the forum identity
       * @param memberId the member identity
       * @param watch the watch state
       */
      function updateGroupWatch(groupId, memberId, watch) {
        var request = $http({
          method: 'PATCH',
          url: FORUMS_API_ENDPOINT + '/groups/' + groupId + '/member/' + memberId + '?access_token=' + FORUMS_API_TOKEN,
          headers: {
            "Content-Type": "application/json"
          },
          data: {
            "watch": watch
          }
        });
        return request.then(
          function (response) {
            if (response.data || response.data.length > 0) {
              return response.data;
            }
          },
          function (error) {
            return _handleError(error);
          }
        );
      };

      /**
       * Get details of group member
       * @param groupId the group identity
       * @param memberId the member identity
       * @returns {Promise} Promise with member details
       */
      function getGroupMemberDetails(groupId, memberId) {
        var request = $http({
          method: 'GET',
          url: FORUMS_API_ENDPOINT + '/groups/' + groupId + '/member/' + memberId + '?access_token=' + FORUMS_API_TOKEN,
          headers: {
            "Content-Type": "application/json"
          }
        });
        return request.then(
          function (response) {
            if (response.data || response.data.length > 0) {
              return response.data;
            } else {
              var err;
              err = {
                status: 404,
              };
              return $q.reject(err);
            }
          },
          function (error) {
            return _handleError(error);
          }
        );
      };

      /**
       * Get roles.
       * @returns {Promise} Promise with collection of role.
       */
      function getRoles() {
        var request = $http({
          method: 'GET',
          url: FORUMS_API_ENDPOINT + '/roles?access_token=' + FORUMS_API_TOKEN,
          headers: {
            "Content-Type": "application/json",
          }
        });
        return request.then(
          function (response) {
            if (response.data || response.data.length > 0) {
              return response.data;
            } else {
              var err;
              err = {
                status: 404,
              };
              return $q.reject(err);
            }
          },
          function (error) {
            return _handleError(error);
          }
        );
      };

      /**
       * Get user by user id.
       * @param {number} userId the user identity.
       * @returns {Promise} Promise with user details.
       */
      function getUser(userId) {
        var request = $http({
          method: 'GET',
          url: FORUMS_API_ENDPOINT + '/users/' + userId + '?access_token=' + FORUMS_API_TOKEN,
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + FORUMS_API_TOKEN
          }
        });
        return request.then(
          function (response) {
            if (response.data || response.data.length > 0) {
              return response.data;
            } else {
              var err;
              err = {
                status: 404,
              };
              return $q.reject(err);
            }
          },
          function (error) {
            return _handleError(error);
          }
        );
      };

      /**
       * Get user by handle.
       * @param {string} handle The user handle.
       * @returns {Promise} Promise with user details.
       */
      function getUserByHandle(handle) {
        var request = $http({
          method: 'GET',
          url: FORUMS_API_ENDPOINT + '/users/by-names?name=' + handle + '&access_token=' + FORUMS_API_TOKEN,
          headers: {
            "Content-Type": "application/json",
          }
        });
        return request.then(
          function (response) {
            if (response.data && response.data.length > 0) {
              return response.data[0];
            } else {
              var err;
              err = {
                status: 404,
              };
              return $q.reject(err);
            }
          },
          function (error) {
            return _handleError(error);
          }
        );
      };

      /**
       * Update / Insert role to user
       * @param userId the user identity
       * @param roleIds the role collection
       */
      function updateUserRoles(userId, roleIds) {
        var request = $http({
          method: 'PATCH',
          url: FORUMS_API_ENDPOINT + '/users/' + userId + '?access_token=' + FORUMS_API_TOKEN,
          headers: {
            "Content-Type": "application/json"
          },
          data: {
            "roleID": roleIds
          }
        });
        return request.then(
          function (response) {
            if (response.data || response.data.length > 0) {
              return response.data;
            }
          },
          function (error) {
            return _handleError(error);
          }
        );
      };

      /**
       * Archive a forum
       * @param groupId the group identity
       */
      function archiveGroup(groupId) {
        var request = $http({
          method: 'PUT',
          url: FORUMS_API_ENDPOINT + '/groups/' + groupId + '/archive?access_token=' + FORUMS_API_TOKEN,
          headers: {
            "Content-Type": "application/json",
          }
        });

        return request.then(
          function (response) {
            if (response.data || response.data.length > 0) {
              return response.data;
            }
          },
          function (error) {
            return _handleError(error);
          }
        );
      };

      /**
       * Get all the comments by user identity.
       * @param userId The user identity.
       * @returns {Promise} Promise with comment collections.
       */
      function getComments(userId) {
        var request = $http({
          method: 'GET',
          url: FORUMS_API_ENDPOINT + '/comments?insertUserID=' + userId + '&access_token=' + FORUMS_API_TOKEN,
          headers: {
            "Content-Type": "application/json",
          }
        });
        return request.then(
          function (response) {
            if (response.data || response.data.length > 0) {
              return response.data;
            } else {
              var err;
              err = {
                status: 404,
              };
              return $q.reject(err);
            }
          },
          function (error) {
            return _handleError(error);
          }
        );
      };

    }]);

