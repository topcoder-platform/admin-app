'use strict';

var module = angular.module('supportAdminApp');

/**
 * The parent controller for the billing accounts states
 */
module.controller('billingaccount.BillingAccountsController', ['$scope', 'AuthService', '$state',
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