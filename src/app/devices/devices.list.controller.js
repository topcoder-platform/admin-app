'use strict';

var module = angular.module('supportAdminApp');

module.controller('devices.DevicesListController', ['$scope', '$rootScope', '$log', 'devices.Constants',
  'DeviceService', 'Alert', '$timeout',
    function ($scope, $rootScope, $log, constants, DeviceService, $alert, $timeout) {

      // search
      $scope.formSearch = {
        isLoading: false,
        criteria: {
          type: "",
          manufacturer: "",
          model: "",
          operatingSystem: "",
          operatingSystemVersion: ""
        },
        setLoading: function(loading) {
          this.isLoading = loading;
        }
      };

      // the current page number
      $scope.pageNumber = 1;
      // the total device count in DB
      $scope.totalDevices = 0;

      // types and manufacturers for autocomplete
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
        if($scope.formSearch.criteria.type == ''){
          return
        }
        // use the 'manufacturers' obtained early if the type is not changed to avoid frequent request
        if($scope.oldType == $scope.formSearch.criteria.type){
          return $scope.manufacturers.filter(function(manufacturer) {
            return manufacturer.toLowerCase().indexOf(loweCaseValue) != -1;
          });
        }
        return DeviceService.getManufacturers($scope.formSearch.criteria.type).then(
          function(manufacturers) {
            $scope.manufacturers  = manufacturers;
            $scope.oldType = $scope.formSearch.criteria.type;
            return $scope.manufacturers.filter(function(manufacturer) {
              return manufacturer.toLowerCase().indexOf(loweCaseValue) != -1;
            });
          });
      }

      /**
       * Search devices
       */
      $scope.search = function (pageReset) {
        $alert.clear();
        var type = $scope.formSearch.criteria.type,
            manufacturer =  $scope.formSearch.criteria.manufacturer,
            model = $scope.formSearch.criteria.model,
            operatingSystem = $scope.formSearch.criteria.operatingSystem,
            operatingSystemVersion = $scope.formSearch.criteria.operatingSystemVersion;

        if(pageReset == true){
          $scope.pageNumber = 1;
        }
        var filter = '';
        filter += "page="+$scope.pageNumber;
        filter += "&perPage="+25;
        if(type) {
          filter += "&type="+type;
        }
        if(manufacturer) {
          filter += "&manufacturer="+manufacturer;
        }
        if(model) {
          filter += "&model="+model;
        }
        if(operatingSystem) {
          filter += "&operatingSystem="+operatingSystem;
        }
        if(operatingSystemVersion) {
          filter += "&operatingSystemVersion="+operatingSystemVersion;
        }

        $scope.formSearch.setLoading(true);
        DeviceService.search(
          {filter: filter}
        ).then(function (response) {
          $scope.devices = response.data;
          $scope.totalDevices = response.headers("X-Total");
          $scope.formSearch.setLoading(false);
        }).catch(function (error) {
          $alert.error(error.error, $rootScope);
          $scope.formSearch.setLoading(false);
        });
      };

      // change to a specific page
      $scope.changePage = function (pageNumber) {
        if (pageNumber === 0 || pageNumber > $scope.getLastPage() || $scope.pageNumber === pageNumber) {
          return false;
        }
        $scope.pageNumber = pageNumber;
        $scope.search();
      };

      // get the number array that shows the pagination bar
      $scope.getPageArray = function() {
        var res = [];
        for (var i = $scope.pageNumber - 5; i <= $scope.pageNumber; i++) {
          if (i > 0) {
            res.push(i);
          }
        }
        for (var i = $scope.pageNumber + 1; i <= $scope.getLastPage() && i <= $scope.pageNumber + 5; i++) {
          res.push(i);
        }
        return res;
      };

      // move to the last page
      $scope.getLastPage = function () {
        return parseInt($scope.totalDevices / 25) + 1;
      };

      // load the types on controller init
      $scope.getTypes();

      // load the devices on controller init
      $scope.search();
    }
]);