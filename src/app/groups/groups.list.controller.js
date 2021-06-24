'use strict';

var module = angular.module('supportAdminApp');

module.controller('permissionmanagement.GroupsListController', [
  '$scope',
  '$rootScope',
  'GroupService',
  'UserService',
  'IdResolverService',
  'Alert',
  '$timeout',
  '$uibModal',
  function($scope, $rootScope, GroupService, UserService, IdResolverService, $alert, $timeout, $modal) {
    // true data is loading
    $scope.isLoading = false;

    // list data
    $scope.groups = [];

    // used to get all groups , increased perPage from 2000 to 3000 to accomodate all groups in one call
    $scope.page = 1;
    $scope.perPage = 3000;

    /* Maps user ids, present in the page, into user handles. */
    $scope.users = {};
    var loadUser = IdResolverService.getUserResolverFunction($scope.users);

    /**
     * Get all groups
     */
    $scope.fetch = function() {
      $alert.clear();
      $scope.isLoading = true;
      GroupService.fetch({ page: $scope.page, perPage: $scope.perPage })
        .then(function(data) {
          $scope.groups = data;
          $scope.groups.forEach(function(group) {
            loadUser(group.createdBy);
            loadUser(group.modifiedBy);
          });
          if ($scope.groups.length) {
            // make sure changes to scope are applied
            // and redraw footable table with current group list
            $timeout(function() {
              $('.footable').trigger('footable_redraw');
              $scope.isLoading = false;
            });
          } else {
            $scope.isLoading = false;
          }
        })
        .catch(function(error) {
          $alert.error(error.error, $rootScope);
          $scope.isLoading = false;
        });
    };

    // init footable plugin
    angular.element(document).ready(function() {
      $('.footable').footable();
    });

    // load the groups on controller init
    $scope.fetch();

    $scope.openGroupEditDialog = function(index) {
      var modalInstance = $modal.open({
        size: 'sm',
        templateUrl: 'app/groups/group-edit-dialog.html',
        controller: 'groups.GroupEditDialogController',
        resolve: {
          parentScope: function() {
            return $scope;
          }
        }
      });
    };
  }
]);
