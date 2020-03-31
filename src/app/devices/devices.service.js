'use strict';

angular.module('supportAdminApp')
  .factory('DeviceService', ['$log', '$q','$http', 'LOOKUP_V5_API_URL',
    function ($log, $q, $http, LOOKUP_V5_API_URL) {
      var DeviceService = { };

      /**
       * Handle API response error
       * @param  {Error}      error           the error as received in catch callback
       * @param  {Object}     deferred        the deferred object
       */
      DeviceService.handleError = function(error, deferred) {
        $log.error(error);
        var err;
        if(error && error.data) {
          err = {
            status: error.status,
            error : error.data.message
          };
        }
        if(!err) {
          err = {
            status: error.status,
            error : error.message
          };
        }
        deferred.reject(err);
      }

      /**
       * Get base API path
       *
       * @return {String} base path
       */
      DeviceService.getBasePath = function() {
        return LOOKUP_V5_API_URL;
      };

      /**
       * Get a list of the Types for autocomplete
       */
      DeviceService.getTypes = function() {
        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: DeviceService.getBasePath() + '/lookups/devices/types',
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          DeviceService.handleError(error, deferred);
        });
        return deferred.promise;
      };

      /**
       * Get a list of the Manufacturers for autocomplete
       */
      DeviceService.getManufacturers = function(type) {
        var deferred = $q.defer();
        $http({
          method: 'GET',
          url: DeviceService.getBasePath() + '/lookups/devices/manufacturers?type=' + type,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          DeviceService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      /**
       * Get a list of all the devices
       */
      DeviceService.search = function(options) {
        var deferred = $q.defer();

        $http({
          method: 'GET',
          url: DeviceService.getBasePath() + '/lookups/devices?' + options.filter,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function (response) {
          deferred.resolve(response);
        }).catch(function (error) {
          DeviceService.handleError(error, deferred);
        });
        return deferred.promise;
      };

      /**
       * Create a device
       */
      DeviceService.createDevice = function (entity) {
        var deferred = $q.defer();
        $http({
          method: 'POST',
          data: entity,
          headers: {
            'Content-Type': 'application/json'
          },
          url: DeviceService.getBasePath() + '/lookups/devices/',
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          DeviceService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      /**
       * Edit the device
       */
      DeviceService.editDevice = function (id, entity) {
        var deferred = $q.defer();
        $http({
          method: 'PATCH',
          data:  entity,
          headers: {
            'Content-Type': 'application/json'
          },
          url: DeviceService.getBasePath() + '/lookups/devices/' + id,
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          DeviceService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      /**
       * find the device by Id
       */
      DeviceService.findDeviceById = function(deviceId) {
        var deferred = $q.defer();
        $http({
          url: DeviceService.getBasePath() + '/lookups/devices/' + deviceId,
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          DeviceService.handleError(error, deferred);
        });
        return deferred.promise;
      }
      return DeviceService;
    }]);
