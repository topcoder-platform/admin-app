'use strict';

angular.module('supportAdminApp')
  .factory('ClientService', ['$log', '$q','$http', 'API_URL', 'API_VERSION_PATH',
    function ($log, $q, $http, API_URL, API_VERSION_PATH) {
      var ClientService = { };

      /**
       * Handle API response error
       * @param  {Error}      error           the error as received in catch callback
       * @param  {Object}     deferred        the deferred object
       */
      ClientService.handleError = function(error, deferred) {
        $log.error(error);
        var err;
        if(error && error.data) {
          err = {
            status: error.status,
            error : error.data.result.content
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

      ClientService.getBasePath = function () {
        return API_URL + '/' + API_VERSION_PATH;
      }

      /**
       * Get a list of all the clients
       */
      ClientService.findAll = function() {
        var deferred = $q.defer();
        $http({
          url: ClientService.getBasePath() + '/clients',
        }).then(function (response) {
          deferred.resolve(response.data.result.content);
        }).catch(function (error) {
          ClientService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      ClientService.createClient = function (entity) {
        entity.startDate = entity.startDate.substring(0,16) + 'Z';
        entity.endDate = entity.endDate.substring(0,16) + 'Z';
        var deferred = $q.defer();
        $http({
          method: 'POST',
          data: {
            param: entity
          },
          headers: {
            'Content-Type': 'application/json'
          },
          url: ClientService.getBasePath() + '/clients',
        }).then(function (response) {
          deferred.resolve(response.data.result.content);
        }).catch(function (error) {
          ClientService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      ClientService.editClient = function (id, entity) {
        var deferred = $q.defer();
        $http({
          method: 'PATCH',
          data: {
            param : entity
          },
          headers: {
            'Content-Type': 'application/json'
          },
          url: ClientService.getBasePath() + '/clients/' + id,
        }).then(function (response) {
          deferred.resolve(response.data.result.content);
        }).catch(function (error) {
          ClientService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      ClientService.findClientById = function(clientId) {
        var deferred = $q.defer();
        $http({
          url: ClientService.getBasePath() + '/clients/' + clientId,
        }).then(function (response) {
          deferred.resolve(response.data.result.content);
        }).catch(function (error) {
          ClientService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      return ClientService;
    }]);
