module.controller('users.GroupsEditDialogController', [
  '$scope', '$uibModalInstance', 'GroupService', 'GroupMemberService', 'Alert', 'user', '$q',
    function ($scope, $modalInstance, GroupService, GroupMemberService, $alert, user, $q) {

      // currently selected user object
      $scope.user = user;

      // currently selected user group list
      $scope.userGroups = [];

      // true if group list is being loaded
      $scope.isLoading = false;

      // true if are removing a group
      $scope.isRemoving = false;

      // true if we are adding a group
      $scope.isAdding = false;

      // group id selected to add
      $scope.groupToAdd = '';

      // list of existent groups where user is not a member
      $scope.availableGroups = [];

      // array of all the existent groups
      var allGroups = [];

      /**
       * Update list of available groups which
       * @return {[type]} [description]
       */
      function updateAvailableGroups() {
        var userGroupIds = $scope.userGroups.map(function(group) {
          return group.id;
        });

        $scope.availableGroups = allGroups.filter(function(group) {
          return userGroupIds.indexOf(group.id) === -1;
        });
      }

      /**
       * Close dialog
       */
      $scope.close = function() {
        $modalInstance.close();
      };

      /**
       * Load user groups and full list of existent groups
       */
      $scope.loadData = function() {
        $scope.isLoading = true;
        $q.all([
          GroupService.findByMember(user.id, 'user'),
          GroupService.fetch()
        ]).then(function(data) {
          // sort group list for easy navigation
          $scope.userGroups = _.sortBy(data[0], 'name');
          allGroups = data[1].content;
          updateAvailableGroups();
        }).catch(function(error) {
          $alert.error(error.error, $scope);
        }).finally(function() {
          $scope.isLoading = false;
        });
      }

      /**
       * Submit add group form
       */
      $scope.addGroup = function() {
        $scope.isAdding = true;
        GroupMemberService.addMember($scope.groupToAdd, {
          memberId: user.id,
          membershipType: 'user'
        }).then(function() {
          $scope.userGroups.push(_.find($scope.availableGroups, { id: $scope.groupToAdd }));
          // keep sorting after adding new group
          $scope.userGroups = _.sortBy($scope.userGroups, 'name');
          $scope.groupToAdd = '';
          updateAvailableGroups();
        }).catch(function(error) {
          $alert.error(error.error, $scope);
        }).finally(function() {
          $scope.isAdding = false;
        });
      }

      /**
       * Helper function which removes group from group list
       *
       * @param  {Object} group group object to remove
       */
      function removeGroupFromList(group) {
        _.remove($scope.userGroups, { id: group.id });
        updateAvailableGroups();
      }

      /**
       * Remove user from specified group
       * @param  {Object} group group from where we have to remove user
       */
      $scope.removeGroup = function(group) {
        $scope.isRemoving = true;
        group.isRemoving = true;
        // to delete a member from a group we have to know membership id
        // the only way to get it is to get all membership records of the group
        // and then find the one for current user
        GroupMemberService.fetch(group.id).then(function(data) {
          var memberships = data.content;

          var membership = _.find(memberships, function(membership) {
            // as memberId is a string and user.id is a number
            // it's safer to convert memberId to a string,
            // because when converting to a number there lots of issues can appear
            return membership.memberId.toString() === user.id;
          });

          if (!membership) {
            // if user is already not a member, show warning but remove group from the list
            $alert.warning('User is already not a member of the group `' + group.name + '`.', $scope);
            removeGroupFromList(group);
          } else {
            return GroupMemberService.removeMember(group.id, membership.id).then(function() {
              removeGroupFromList(group);
            });
          }
        }).catch(function(error) {
          $alert.error('Cannot remove from the group `' + group.name + '`. Server error: "' + error.error + '"', $scope);
        }).finally(function() {
          // always clean the flag as we can add this group back
          group.isRemoving = false;
          // check if anything is still removing
          $scope.isRemoving = !!_.find($scope.userGroups, { isRemoving: true });
        });
      }

      $scope.loadData();

    }
]);
