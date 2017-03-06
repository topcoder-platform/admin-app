'use strict';

var module = angular.module('supportAdminApp');

module.controller('billingaccount.NewBillingAccountController', ['$scope', '$rootScope', '$log',
  'BillingAccountService', 'Alert', '$state',
    function ($scope, $rootScope, $log, BillingAccountService, $alert, $state) {
      $scope.processing = false;

      $scope.newAccount = { status: 'Active' };

      // date picker options
      $scope.endDateOptions = {
        minDate: new Date()
      };

      $scope.startDateOptions = { };

      /**
       * Submit the billing account to the API
       */
      $scope.submitAccount = function () {
        $scope.processing = true;
        BillingAccountService.createBillingAccount($scope.newAccount).then(function () {
          $scope.processing = false;
          $state.go('index.billingaccounts.list');
        }).catch(function (error) {
          $alert.error(error.error, $rootScope);
          $scope.processing = false;
        });
      };

      /**
       * open datetimepicker
       * @param  {object} e         event object
       * @param  {string} inputName startsAt | endsAt
       */
      $scope.openCalendar = function (e, inputName) {
        if ($scope[inputName + 'Open']) {
          return;
        }

        if (e && e.preventDefault) {
          e.preventDefault();
        }
        if (e && e.stopPropagation) {
          e.stopPropagation();
        }
        $scope[inputName + 'Open'] = true;
      };

      /**
       * Callback executed when start date is updated
       */
      $scope.onStartDateCallback = function () {
        $scope.endDate = $scope.endDateOptions.minDate = new Date($scope.newAccount.startDate);
      };

      /**
       * Callback executed when end date is updated
       */
      $scope.onEndDateCallback = function () {
        $scope.startDate = $scope.startDateOptions.maxDate = new Date($scope.newAccount.endDate);
      }
    }
]);