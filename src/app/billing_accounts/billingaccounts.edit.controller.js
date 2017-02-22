'use strict';

var module = angular.module('supportAdminApp');

/**
 * Controller for edit billing account view
 */
module.controller('billingaccount.EditBillingAccountController', ['$scope', '$rootScope', '$log',
  'BillingAccountService', 'Alert', '$state', '$stateParams',
    function ($scope, $rootScope, $log, BillingAccountService, $alert, $state, $stateParams) {
      $scope.processing = false;

      $scope.account = { };

      // fetch initial data
      if ($stateParams.accountId) {
        BillingAccountService.findBillingAccountById($stateParams.accountId).then(function (data) {
          $scope.account = data;
          $scope.endDateOptions.minDate = new Date(data.startDate);
          $scope.startDateOptions.maxDate = new Date(data.endDate);
        });
      }

      // start date and end date options
      $scope.endDateOptions = {
        minDate: new Date()
      };

      $scope.startDateOptions = { };

      $scope.submitAccount = function () {
        $scope.processing = true;
        var entity = Object.assign({ }, $scope.account);
        delete entity.id;
        delete entity.createdBy;
        delete entity.createdAt;
        delete entity.updatedAt;
        delete entity.updatedBy;
        BillingAccountService.editBillingAccount($scope.account.id, entity).then(function () {
          $scope.processing = false;
          $state.go('index.billingaccounts.list');
        }).catch(function (error) {
          $alert.error(error.error.message, $rootScope);
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
        $scope.endDate = $scope.endDateOptions.minDate = new Date($scope.account.startDate);
      };

      /**
       * Callback executed when end date is updated
       */
      $scope.onEndDateCallback = function () {
        $scope.startDate = $scope.startDateOptions.maxDate = new Date($scope.account.endDate);
      }
    }
]);