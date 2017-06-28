module.controller('users.RolesEditDialogController', [
  '$scope', '$uibModalInstance', 'RoleService', 'Alert', 'user', '$q',
    function ($scope, $modalInstance, RoleService, $alert, user, $q) {

      // currently selected user object
      $scope.user = user;

      // currently selected user role list
      $scope.userRoles = [];

      // true if role list is being loaded
      $scope.isLoading = false;

      // true if are removing a role
      $scope.isRemoving = false;

      // true if we are adding a role
      $scope.isAdding = false;

      // role id selected to add
      $scope.roleToAdd = '';

      // list of existent roles where user is not a member
      $scope.availableRoles = [];

      // array of all the existent roles
      var allRoles = [];

      /**
       * Update list of available roles which
       * @return {[type]} [description]
       */
      function updateAvailableRoles() {
        var userRoleIds = $scope.userRoles.map(function(role) {
          return role.id;
        });

        $scope.availableRoles = allRoles.filter(function(role) {
          return userRoleIds.indexOf(role.id) === -1;
        });
      }

      /**
       * Close dialog
       */
      $scope.close = function() {
        $modalInstance.close();
      };

      /**
       * Load user roles and full list of existent roles
       */
      $scope.loadData = function() {
        $scope.isLoading = true;
        $q.all([
          RoleService.getRolesBySubject(user.id).catch(function(error) {
            // if use doesn't have any roles, backend return error 404
            // we catch this error and return empty error in this case
            if (error.status === 404) {
              return [];

            // in other cases we return rejected promise further
            } else {
              return $q.reject(error);
            }
          }),
          RoleService.getRoles()
        ]).then(function(data) {
          $scope.userRoles = data[0];
          allRoles = data[1];
          updateAvailableRoles();
        }).catch(function(error) {
          $alert.error(error.error, $scope);
        }).finally(function() {
          $scope.isLoading = false;
        });
      }

      /**
       * Submit add role form
       */
      $scope.addRole = function() {
        $scope.isAdding = true;
        RoleService.assignRole($scope.roleToAdd, user.id).then(function() {
          $scope.userRoles.push(_.find($scope.availableRoles, { id: $scope.roleToAdd }));
          // as roles sorted by default we keep them sorted
          $scope.userRoles = _.sortBy($scope.userRoles, 'roleName');
          $scope.roleToAdd = '';
          updateAvailableRoles();
        }).catch(function(error) {
          $alert.error(error.error, $scope);
        }).finally(function() {
          $scope.isAdding = false;
        });
      }

      /**
       * Helper function which removes role from role list
       *
       * @param  {Object} role role object to remove
       */
      function removeRoleFromList(role) {
        _.remove($scope.userRoles, { id: role.id });
        updateAvailableRoles();
      }

      /**
       * Remove user from specified role
       * @param  {Object} role role from where we have to remove user
       */
      $scope.removeRole = function(role) {
        $scope.isRemoving = true;
        role.isRemoving = true;
        return RoleService.unassignRole(role.id, user.id).then(function() {
          removeRoleFromList(role);
        }).catch(function(error) {
          $alert.error('Cannot remove from the role `' + role.roleName + '`. Server error: "' + error.error + '"', $scope);
        }).finally(function() {
          // always clean the flag as we can add this role back
          role.isRemoving = false;
          // check if anything is still removing
          $scope.isRemoving = !!_.find($scope.userRoles, { isRemoving: true });
        });
      }

      $scope.loadData();

    }
]);
