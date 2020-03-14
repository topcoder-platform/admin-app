'use strict';

var module = angular.module('supportAdminApp');

module.controller('devices.NewDeviceController', ['$scope', '$rootScope', '$log',
  'DeviceService', 'Alert', '$state',
    function ($scope, $rootScope, $log, DeviceService, $alert, $state) {
      $scope.processing = false;

      $scope.device = { };

      // create new device
      $scope.submitDevice = function () {
        $scope.processing = true;
        var entity = Object.assign({ }, $scope.device);
        DeviceService.createDevice(entity).then(function () {
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
        if($scope.device.type == ''){
          return
        }
        // use the 'manufacturers' obtained early if the type is not changed to avoid frequent request
        if($scope.oldType == $scope.device.type){
          return $scope.manufacturers.filter(function(manufacturer) {
            return manufacturer.indexOf(viewValue) != -1;
          });
        }
        return DeviceService.getManufacturers($scope.device.type).then(
          function(manufacturers) {
            $scope.manufacturers  = manufacturers;
            $scope.oldType = $scope.device.type;
            return $scope.manufacturers.filter(function(manufacturer) {
              return manufacturer.indexOf(viewValue) != -1;
            });
          });
      }

      // load the types on controller init
      $scope.getTypes();
    }
]);