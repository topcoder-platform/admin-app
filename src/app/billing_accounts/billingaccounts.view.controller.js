'use strict';

var module = angular.module('supportAdminApp');

/**
 * Controller for view billing account page
 */
module.controller('billingaccount.ViewBillingAccountController', ['$scope', '$rootScope', '$log',
  'BillingAccountService', 'Alert', '$state', '$stateParams',
    function ($scope, $rootScope, $log, BillingAccountService, $alert, $state, $stateParams) {

      $scope.account = { };

      // fetch initial data
      if ($stateParams.accountId) {
        BillingAccountService.findBillingAccountById($stateParams.accountId).then(function (data) {
          $scope.account = data;
        });
      }
    }
]);