'use strict';

var module = angular.module('supportAdminApp');

/**
 * Controller for edit device view
 */
module.controller('devices.EditDeviceController', ['$scope', '$rootScope', '$log',
  'DeviceService', 'Alert', '$state', '$stateParams',
    function ($scope, $rootScope, $log, DeviceService, $alert, $state, $stateParams) {
      $scope.processing = false;
      $scope.device = { };

      // fetch initial data
      if ($stateParams.deviceId) {
        DeviceService.findDeviceById($stateParams.deviceId).then(function (data) {
          $scope.device = data;
        });
      }

      // submit changes
      $scope.submitDevice = function () {
        $scope.processing = true;
        var entity = Object.assign({ }, $scope.device);
        delete entity.id;
        DeviceService.editDevice($scope.device.id, entity).then(function () {
          $scope.processing = false;
          $state.go('index.devices.list');
        }).catch(function (error) {
          $alert.error(error.error, $rootScope);
          $scope.processing = false;
        });
      };

      // type and manufacturer for autocomplete
      $scope.types = [];
      $scope.manufacturers = [];

      // get the Type for autocomplete
      $scope.getTypes = function () {
        DeviceService.getTypes().then(function(types) {
          $scope.types = types;
        });
      }

      // manufacturer autocomplete
      $scope.oldType = '';
      $scope.getManufacturers = function (viewValue) {
        var loweCaseValue = viewValue.toLowerCase()
        if($scope.device.type == ''){
          return
        }
        // use the 'manufacturers' obtained early if the type is not changed to avoid frequent request
        if($scope.oldType == $scope.device.type){
          return $scope.manufacturers.filter(function(manufacturer) {
            return manufacturer.toLowerCase().indexOf(loweCaseValue) != -1;
          });
        }
        return DeviceService.getManufacturers($scope.device.type).then(
          function(manufacturers) {
            $scope.manufacturers  = manufacturers;
            $scope.oldType = $scope.device.type;
            return $scope.manufacturers.filter(function(manufacturer) {
              return manufacturer.toLowerCase().indexOf(loweCaseValue) != -1;
            });
          });
      }

      // load the types on controller init
      $scope.getTypes();
    }
]);