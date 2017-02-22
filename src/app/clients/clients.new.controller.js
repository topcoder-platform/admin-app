'use strict';

var module = angular.module('supportAdminApp');

module.controller('billingaccount.NewClientController', ['$scope', '$rootScope', '$log',
  'ClientService', 'Alert', '$state',
    function ($scope, $rootScope, $log, ClientService, $alert, $state) {
      $scope.processing = false;

      $scope.newClient = { status: 'active' };

      // date picker options
      $scope.endDateOptions = {
        minDate: new Date()
      };

      $scope.startDateOptions = { };

      /**
       * Submit the client to the API
       */
      $scope.submitClient = function () {
        $scope.processing = true;
        ClientService.createClient($scope.newClient).then(function () {
          $scope.processing = false;
          $state.go('index.clients.list');
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
        $scope.endDate = $scope.endDateOptions.minDate = new Date($scope.newClient.startDate);
      };

      /**
       * Callback executed when end date is updated
       */
      $scope.onEndDateCallback = function () {
        $scope.startDate = $scope.startDateOptions.maxDate = new Date($scope.newClient.endDate);
      }
    }
]);