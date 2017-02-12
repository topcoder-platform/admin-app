'use strict';

var module = angular.module('supportAdminApp');

/**
 * The parent controller for the billing account resources states
 */
module.controller('billingaccount.BillingAccountResourcesController', ['$scope', 'AuthService', '$state',
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