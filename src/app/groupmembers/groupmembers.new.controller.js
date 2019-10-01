'use strict';

var module = angular.module('supportAdminApp');

module.controller('permissionmanagement.GroupMembersNewController', [
              '$scope', '$rootScope', 'GroupMemberService', 'UserService', 'GroupService', 'IdResolverService', '$q', 'Alert', '$state', '$stateParams',
    function ($scope, $rootScope, GroupMemberService, UserService, GroupService, IdResolverService, $q, $alert, $state, $stateParams) {

      // current group id
      $scope.groupId = $stateParams.groupId;

      // true if adding new members now
      $scope.processing = false;

      // selected membership type to add
      $scope.membershipType = 'user';

      // if there were any errors during form submission
      var hasSubmissionErrors = false;

      /* Maps groups ids, present in the page, into group names. */
      $scope.groups = {};
      var loadGroup = IdResolverService.getGroupResolverFunction($scope.groups);

      /**
       * Add a member to the current group
       *
       * @param {Object}   membership object with memberId and membershipType fields
       * @return {Promise}            promise to add a member
       */
      function addMember(membership) {
        return GroupMemberService.addMember($scope.groupId, membership).catch(function(error) {
          hasSubmissionErrors = true;
          $alert.error('Cannot add member with id: ' + membership.memberId + '. Server error: "' + error.error + '".', $rootScope );
        });
      }

      /**
       * Get user id by its handle
       *
       * @param  {String} userHandle handle of the user
       * @return {Promise}           promise to get user id
       */
      function getUserId(userHandle) {
        return UserService.find({
            filter: 'handle=' + userHandle
        }).then(function (data) {
            var userId = '';

            if (data.length) {
              userId = data[0].id;
            } else {
              // if response was successful, but user was not found, just return error about that
              return $q.reject({
                status: 404,
                error: 'Cannot find user id with handle: ' + userHandle
              });
            }

            return userId;
        }).catch(function(error) {
          if (error.status === 404) {
            // if the error has status 404, we return it without changes
            return $q.reject(error);
          } else {
            // if there was some other error during request, then we also return specific error from the server
            return $q.reject({
              status: error.status,
              error: 'Cannot find user id with handle: `' + userHandle + '`. Server error: "' + error.error + '".'
            });
          }
        })
      }

      /**
       * Checks if group exists by its id
       *
       * @param  {String} groupId group id
       * @return {Promise}        promise to check that group exists
       */
      function checkGoupExists(groupId) {
        return GroupService.findById(groupId, ['id']).catch(function(error) {
          // we also return server error, as there could be various details about why group is not found
          return $q.reject({
            status: error.status,
            error: 'Cannot find group with id: ' + groupId + '. Server error: "' + error.error + '".'
          });
        });
      }

      /**
       * Submit all
       */
      $scope.submitMemberships = function () {
        $alert.clear();

        // get list of new members to add
        // handles for users
        // group ids for groups
        var members = $scope.membershipType === 'user' ? $scope.userHandles : $scope.groupIds;
        members = members.split(',').map(function(member) {
          return member.trim();
        });

        $scope.processing = true;
        hasSubmissionErrors = false;
        // for now we submit all new members in parallel
        // it's preferable, because it's faster
        // though if there will be any issues with server overload
        // it can be rewritten so requests go one by one
        $q.all(members.map(function(memberId) {
          // for members type of 'user' we have to find userId first
          if ($scope.membershipType === 'user') {
            return getUserId(memberId).then(function(userId) {
              return addMember({
                memberId: userId,
                membershipType: $scope.membershipType
              });
            }).catch(function(error) {
              // if user is not found, show error
              hasSubmissionErrors = true;
              $alert.error(error.error, $rootScope);
            });

          // for members type of group we already have group ids
          } else {
            // prevent infinite loops
            if ($scope.groupId === memberId) {
              hasSubmissionErrors = true;
              $alert.error('Adding a group with id `' + memberId + '` as a sub-group of itself is not allowed.', $rootScope);
              return $q.resolve();
            }

            // as backend doesn't check existence of the group we are adding as a member
            // we have to check if group with provided id exists
            return checkGoupExists(memberId).then(function() {
              return addMember({
                memberId: memberId,
                membershipType: $scope.membershipType
              });
            }).catch(function(error) {
              // if group is not found, show error
              hasSubmissionErrors = true;
              $alert.error(error.error, $rootScope);
            });
          }
        })).then(function() {
          // if there were any errors we don't return to the list, so user can see error messages
          if (!hasSubmissionErrors) {
            $state.go('index.groupmembers.list', { groupId: $scope.groupId });
          }
        }).catch(function (error) {
          $alert.error(error.error, $rootScope);
        }).finally(function() {
          $scope.processing = false;
        });
      };

      // load name of current group
      loadGroup($scope.groupId)
    }
]);
