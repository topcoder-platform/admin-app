'use strict';

var module = angular.module('supportAdminApp');

module.controller('permissionmanagement.GroupsListController', [
              '$scope', '$rootScope', 'GroupService', 'UserService', 'IdResolverService', 'Alert',
    function ($scope, $rootScope, GroupService, UserService, IdResolverService, $alert) {

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
          })
        }).catch(function (error) {
          $alert.error(error.error, $rootScope);
        }).finally(function() {
          $scope.isLoading = false;
        });
      };

      // load the groups on controller init
      $scope.fetch();
    }
]);
