'use strict';

angular.module('supportAdminApp')
  .factory('ClientService', ['$log', '$q','$http', 'BILLING_ACCOUNT_API_URL', 'BILLING_ACCOUNT_API_VERSION_PATH',
    function ($log, $q, $http, BILLING_ACCOUNT_API_URL, BILLING_ACCOUNT_API_VERSION_PATH) {
      var ClientService = { };

      /**
       * Handle API response error
       * @param  {Error}      error           the error as received in catch callback
       * @param  {Object}     deferred        the deferred object
       */
      ClientService.handleError = function(error, deferred) {
        $log.error(error);
        var err;
        if(error && error.data && error.data.result) {
          err = {
            status: error.status,
            error : error.data.result.content
          };
        }
        if(!err) {
          err = {
            status: error.status,
            error : error.statusText
          };
        }
        deferred.reject(err);
      }

      ClientService.getBasePath = function () {
        return BILLING_ACCOUNT_API_URL + '/api/' + BILLING_ACCOUNT_API_VERSION_PATH;
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
        var deferred = $q.defer();
        $http({
          method: 'POST',
          data: entity,
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
          data: entity,
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