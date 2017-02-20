'use strict';

var module = angular.module('supportAdminApp');

module.controller('billingaccount.NewBillingAccountResourceController', ['$scope', '$rootScope', '$log',
  'BillingAccountResourceService', 'Alert', '$state', '$stateParams',
    function ($scope, $rootScope, $log, BillingAccountResourceService, $alert, $state, $stateParams) {
      $scope.processing = false;
      $scope.billingAccountId = $stateParams.accountId;
      $scope.newResource = { status: 'active' };

      /**
       * Submit the resource to the API
       */
      $scope.submitResource = function () {
        $scope.processing = true;
        BillingAccountResourceService.createBillingAccountResource($scope.billingAccountId, $scope.newResource).then(function () {
          $scope.processing = false;
          $state.go('index.billingaccountresources.list', { accountId: $scope.billingAccountId });
        }).catch(function (error) {
          $alert.error(error.error.message, $rootScope);
          $scope.processing = false;
        });
      };
    }
]);