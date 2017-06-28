angular.module('supportAdminApp')
.controller('permissionmanagement.RolesListController', [
  '$scope', '$timeout', 'RoleService', 'IdResolverService',
  function ($scope, $timeout, RoleService, IdResolverService) {

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
      RoleService.createRole(vm.searchCreateRoleText)
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
          'Error: ' + (error.error || 'Failed to create role!');
      }).then(function() {
        vm.creatingNewRole = false;
        $scope.$broadcast('permissionManagement.DataUpdated');
      });
    }

    /* Role assignments. */

    vm.assignment = {};

    /* Loading roles. */

    vm.loadingRoles = true;
    vm.loadingRolesError = null;
    RoleService.getRoles().then(function(roles) {
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
    var loadUser = IdResolverService.getUserResolverFunction(vm.users);

  }
]);
