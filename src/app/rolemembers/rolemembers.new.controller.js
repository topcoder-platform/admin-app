'use strict';

var module = angular.module('supportAdminApp');

module.controller('permissionmanagement.RoleMembersNewController', [
              '$scope', '$rootScope', 'RoleService', 'UserService', '$q', 'Alert', '$state', '$stateParams',
    function ($scope, $rootScope, RoleService, UserService, $q, $alert, $state, $stateParams) {

      // current role object
      $scope.role = null;

      // true if adding new members now
      $scope.isProcessing = false;

      // if there were any errors during form submission
      var hasSubmissionErrors = false;

      /**
       * Get role object
       *
       * @param  {String} roleId role id to get
       */
      function loadRole(roleId) {
        $alert.clear();

        RoleService.getRole(roleId, ['id', 'roleName']).then(function(role) {
          $scope.role = role;
        }).catch(function (error) {
          $alert.error(error.error, $rootScope);
        });
      };


      /**
       * Add a member to the current role
       *
       * @param {String}   memberId member id
       * @return {Promise}          promise to add a member
       */
      function addMember(memberId) {
        return RoleService.assignRole($scope.role.id, memberId).catch(function(error) {
          hasSubmissionErrors = true;
          $alert.error('Cannot add member with id: ' + memberId + '. Server error: "' + error.error + '".', $rootScope );
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
       * Submit all
       */
      $scope.submitMember = function () {
        $alert.clear();

        // get list of user handles to add
        var handles = $scope.userHandles.split(',').map(function(handle) {
          return handle.trim();
        });

        $scope.isProcessing = true;
        hasSubmissionErrors = false;
        // for now we submit all new members in parallel
        // it's preferable, because it's faster
        // though if there will be any issues with server overload
        // it can be rewritten so requests go one by one
        $q.all(handles.map(function(handle) {
          // we have to find userId first
          return getUserId(handle).then(function(userId) {
            return addMember(userId);
          }).catch(function(error) {
            // if user is not found, show error
            hasSubmissionErrors = true;
            $alert.error(error.error, $rootScope);
          });
        })).then(function() {
          // if there were any errors we don't return to the list, so user can see error messages
          if (!hasSubmissionErrors) {
            $state.go('index.rolemembers.list', { roleId: $scope.role.id });
          }
        }).catch(function (error) {
          $alert.error(error.error, $rootScope);
        }).finally(function() {
          $scope.isProcessing = false;
        });
      };

      // load role object on init
      loadRole($stateParams.roleId);
    }
]);
