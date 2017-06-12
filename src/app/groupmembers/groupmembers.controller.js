'use strict';

var module = angular.module('supportAdminApp');

/**
 * The parent controller for the groupmembers states
 */
module.controller('permissionmanagement.GroupMembersController', ['$scope', 'AuthService', '$state',
  function ($scope, $authService, $state) {
    $scope.$state = $state;

    /**
     * Validate the user authentication
     */
    $scope.authorized = function() {
      return $authService.isLoggedIn();
    };
  }
]);
