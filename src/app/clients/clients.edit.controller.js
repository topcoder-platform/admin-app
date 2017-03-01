'use strict';

var module = angular.module('supportAdminApp');

/**
 * Controller for edit client view
 */
module.controller('billingaccount.EditClientController', ['$scope', '$rootScope', '$log',
  'ClientService', 'Alert', '$state', '$stateParams',
    function ($scope, $rootScope, $log, ClientService, $alert, $state, $stateParams) {
      $scope.processing = false;

      $scope.client = { };

      // fetch initial data
      if ($stateParams.clientId) {
        ClientService.findClientById($stateParams.clientId).then(function (data) {
          $scope.client = data;
          $scope.endDateOptions.minDate = new Date(data.startDate);
          $scope.startDateOptions.maxDate = new Date(data.endDate);
        });
      }

      // start date and end date options
      $scope.endDateOptions = {
        minDate: new Date()
      };

      $scope.startDateOptions = { };

      $scope.submitClient = function () {
        $scope.processing = true;
        var entity = Object.assign({ }, $scope.client);
        delete entity.id;
        ClientService.editClient($scope.client.id, entity).then(function () {
          $scope.processing = false;
          $state.go('index.clients.list');
        }).catch(function (error) {
          $alert.error(error.message, $rootScope);
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
        $scope.endDate = $scope.endDateOptions.minDate = new Date($scope.client.startDate);
      };

      /**
       * Callback executed when end date is updated
       */
      $scope.onEndDateCallback = function () {
        $scope.startDate = $scope.startDateOptions.maxDate = new Date($scope.client.endDate);
      }
    }
]);