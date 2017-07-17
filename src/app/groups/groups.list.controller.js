'use strict';

var module = angular.module('supportAdminApp');

module.controller('permissionmanagement.GroupsListController', [
              '$scope', '$rootScope', 'GroupService', 'UserService', 'IdResolverService', 'Alert', '$timeout',
    function ($scope, $rootScope, GroupService, UserService, IdResolverService, $alert, $timeout) {

      // true data is loading
      $scope.isLoading = false;

      // list data
      $scope.groups = [];

      /* Maps user ids, present in the page, into user handles. */
      $scope.users = {};
      var loadUser = IdResolverService.getUserResolverFunction($scope.users);

      /**
       * Get all groups
       */
      $scope.fetch = function () {
        $alert.clear();
        $scope.isLoading = true;
        GroupService.fetch().then(function(data) {
          $scope.groups = data.content;
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
        }).catch(function (error) {
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
    }
]);
