'use strict';

var module = angular.module('supportAdminApp');

module.controller('permissionmanagement.GroupMembersListController', [
              '$scope', '$rootScope', 'GroupMemberService', 'IdResolverService', '$stateParams', '$state', '$q', 'Alert',
    function ($scope, $rootScope, GroupMemberService, IdResolverService, $stateParams, $state, $q, $alert) {

      // keep member types for easy iterating
      $scope.memberTypes = ['group', 'user'];

      // true if list is loading
      $scope.isLoading = false;

      // true if something is we are removing a bulk of entries
      $scope.processing = false;

      // list data
      $scope.memberships = {};
      $scope.memberTypes.forEach(function(memberType) {
        $scope.memberships[memberType] = [];
      });

      // current group id
      $scope.groupId = $stateParams.groupId;

      // true if any members were selected in the list
      $scope.hasSelected = false;

      // keeps
      $scope.isAllSelected = {};
      $scope.memberTypes.forEach(function(memberType) {
        $scope.isAllSelected[memberType] = false;
      });

      /* Maps user ids, present in the page, into user handles. */
      $scope.users = {};
      var loadUser = IdResolverService.getUserResolverFunction($scope.users);

      /* Maps groups ids, present in the page, into group names. */
      $scope.groups = {};
      var loadGroup = IdResolverService.getGroupResolverFunction($scope.groups);

      /**
       * Return membership records which are selected in the table by checkboxes
       *
       * @return {Array} membership records
       */
      function getSelectedMemberships() {
        return $scope.memberTypes.reduce(function(selectedMemberships, memberType) {
          return selectedMemberships.concat($scope.memberships[memberType].filter(function(membership) {
            return membership.isSelected;
          }));
        }, []);
      }

      /**
       * Get list of group members for specified group
       *
       * @param  {String} groupId group id for getting members
       */
      $scope.fetch = function(groupId) {
        $alert.clear();
        $scope.isLoading = true;

        GroupMemberService.fetch(groupId).then(function(data) {
          $scope.memberTypes.forEach(function(memberType) {
            $scope.memberships[memberType] = data.content.filter(function(membership) { return membership.membershipType === memberType });
            $scope.memberships[memberType].forEach(function(membership) {
              loadUser(membership.createdBy);
              loadUser(membership.modifiedBy);

              if (memberType === 'user') {
                // for user members load handles
                loadUser(membership.memberId);
              } else {
                // for group members load names
                loadGroup(membership.memberId);
              }
            });
          });
        }).catch(function (error) {
          $alert.error(error.error, $rootScope);
        }).finally(function() {
          $scope.isLoading = false;
        });
      };

      /**
       * Checks if any membership records are selected in the table
       * and updates $scope.hasSelected value
       */
      $scope.checkSelected = function() {
        $scope.hasSelected = !!getSelectedMemberships().length;
      }

      /**
       * Toggle all selected membership records of specified type
       *
       * @param  {String} memberType type of membership
       */
      $scope.toggleAll = function(memberType) {
        $scope.memberships[memberType].forEach(function(membership) { membership.isSelected = $scope.isAllSelected[memberType] });
      }

      /**
       * Removes member from the current group
       * After removing record from the server, it removes the record from the table
       *
       * @param  {Object}  membership membership record
       * @return {Promise}            promise to remove member
       */
      $scope.removeMember = function(membership) {
        membership.isRemoving = true;
        return GroupMemberService.removeMember($stateParams.groupId, membership.id).then(function() {
          $scope.memberships[membership.membershipType] = $scope.memberships[membership.membershipType].filter(function(record) {
            return record.id !== membership.id;
          });
        }).catch(function(error) {
          membership.isRemoving = false;
          $alert.error('Cannot remove member with id `' + membership.memberId + '`. ' + error.error, $rootScope);
        });
      }

      /**
       * Remove all selected membership records
       */
      $scope.removeSelected = function() {
        $alert.clear();
        $scope.processing = true;

        var selectedMemberships = getSelectedMemberships();

        // for now we remove all members in parallel
        // it's preferable, because it's faster
        // though if there will be any issues with server overload
        // it can be rewritten so requests go one by one
        $q.all(selectedMemberships.map(function(membership) {
          return $scope.removeMember(membership);
        })).catch(function(error) {
          $alert.error(error.error, $rootScope);
        }).finally(function() {
          $scope.processing = false;
        });
      }

      // load the clients on controller init
      $scope.fetch($stateParams.groupId);

      // load name of current group
      loadGroup($scope.groupId)
    }
]);
