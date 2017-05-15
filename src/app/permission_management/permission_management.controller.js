angular.module('supportAdminApp')
.controller('PermissionManagementCtrl', [
  '$scope', '$timeout', 'PermissionManagementService', 'UserService',
  function ($scope, $timeout, PMService, UserService) {

    var vm = this;

    /* Table initialization. */

    angular.element(document).ready(function() {
      $('.footable').footable({
        addRowToggle: true
      });
    });

    $scope.$on('permissionManagement.DataUpdated', function(event) {
      $timeout(function () {
        $('.footable').trigger('footable_redraw');
      }, 100);
    });

    /* Role search by name. */

    vm.searchCreateRoleText = '';

    vm.clearRoleSearch = function() {
      vm.searchCreateRoleText = '';
      vm.searchRole();
    }

    vm.searchRole = function() {
      $('.footable').trigger('footable_filter', {
        filter: vm.searchCreateRoleText,
      });
    }

    /* Role creation. */

    vm.creatingNewRole = false;
    vm.createNewRoleError = '';

    vm.createNewRole = function() {
      vm.creatingNewRole = true;
      vm.createNewRoleError = '';
      PMService.createRole(vm.searchCreateRoleText)
      .then(function(res) {
        vm.roles.push(res);
        loadUser(res.createdBy);
        loadUser(res.modifiedBy);
        vm.assignment[res.id] = {};
        vm.roles = vm.roles.sort(function(a, b) {
          return a.roleName.localeCompare(b.roleName);
        });
      }, function(error) {
        vm.createNewRoleError =
          'Error: ' + (error.message || 'Failed to create role!');
      }).then(function() {
        vm.creatingNewRole = false;
        $scope.$broadcast('permissionManagement.DataUpdated');
      });
    }

    /* Role assignments. */

    vm.assignment = {};

    /**
     * Assigns role to the user.
     * @param {String} roleId
     * @param {String} userHandle
     */
    vm.assignRole = function(roleId, userHandle) {
      vm.assignment[roleId].inProgress = true;
      vm.assignment[roleId].error = '';
      vm.assignment[roleId].info = '';
      var userId;
      UserService.find({
        filter: 'handle=' + userHandle,
      }).then(function(res) {
        if (!res.length) throw new Error('No user found!');
        userId = res[0].id;
        vm.users[userId] = userHandle;
        return PMService.assignRole(roleId, userId);
      }).then(function() {
        var role = vm.roles.find(function (r) { return r.id === roleId; });
        vm.assignment[roleId].info =
          'Success: Role ' + role.roleName
          + ' assigned to the user ' + userHandle;
      }, function(error) {
        vm.assignment[roleId].error =
          'Error: ' + (error.message || 'Failed to assign role!');
      }).then(function() {
        vm.assignment[roleId].inProgress = false;
      });
    }

    /**
     * Unassign role from the user.
     * @param {String} roleId
     * @param {String} userId
     */
    vm.unassignRole = function(roleId, userHandle) {
      vm.assignment[roleId].error = '';
      var role = vm.roles.find(function(r) {
        return r.id === roleId;
      });
      vm.assignment[roleId].error = '';
      vm.assignment[roleId].info = '';
      var userId;
      UserService.find({
        filter: 'handle=' + userHandle,
      }).then(function (res) {
        if (!res.length) throw new Error('No user found!');
        userId = res[0].id;
        vm.users[userId] = userHandle;
        if (confirm('Unassign role ' + role.roleName + ' from user ' + vm.users[userId] + '?')) {
          return PMService.unassignRole(roleId, userId).then(function() {
            var role = vm.roles.find(function (r) { return r.id === roleId; });
            vm.assignment[roleId].info =
              'Success: Role ' + role.roleName
              + ' unassigned from the user ' + userHandle;
          });
        }
      }).catch(function(error) {
        vm.assignment[roleId].error =
          'Error: ' + (error.message || 'Failed to unassign role!');
      });
    };

    /* Loading roles. */

    vm.loadingRoles = true;
    vm.loadingRolesError = null;
    PMService.getRoles().then(function(roles) {
      vm.roles = roles;
      roles.forEach(function(role) {
        vm.assignment[role.id] = {};
        loadUser(role.createdBy);
        loadUser(role.modifiedBy);
      });
    }, function(error) {
      vm.loadingRolesError =
        'Error: ' + (error.message || 'Failed to load roles!');
    }).then(function() {
      vm.loadingRoles = false;
      $scope.$broadcast('permissionManagement.DataUpdated');
    });

    /* Maps user ids, present in the page, into user handles. */
    vm.users = {};

    /**
     * Loads handle of the user specified by id into $scope.users. Does nothing,
     * if the handle is already in there. To avoid overflooding API with
     * requests, this function handles the calls sequentially.
     * @param {String} id User ID.
     */
    var loadingUser = false;
    var userLoadQueue = [];
    function loadUser(id) {
      if (id && !vm.users[id]) {
        if (loadingUser) userLoadQueue.push(id);
        else {
          loadingUser = true;
          UserService.findById(id).then(function(res) {
            vm.users[id] = res.handle;
            loadingUser = false;
            while (userLoadQueue.length) {
              var next = userLoadQueue[0];
              userLoadQueue = userLoadQueue.slice(1);
              if (!vm.users[next]) return loadUser(next);
            }
          });
        }
      }
    }
  }
]);