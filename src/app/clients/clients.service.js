'use strict';

angular.module('supportAdminApp')
  .factory('ClientService', ['$log', '$q','$http', 'API_URL', 'API_VERSION_PATH',
    function ($log, $q, $http, API_URL, API_VERSION_PATH) {
      var ClientService = { };

      function serialize(obj) {
        var result = [];
        for (var property in obj) {
          result.push(encodeURIComponent(property) + "=" + obj[property]);
        }
        return result.join("&");
      }

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
      ClientService.search = function(criteria, pageAndSort) {
        if (criteria.startDate && criteria.startDate.length) {
          criteria.startDate = criteria.startDate.substring(0,16) + 'Z';
        }
        if (criteria.endDate && criteria.endDate.length) {
          criteria.endDate = criteria.endDate.substring(0,16) + 'Z';
        }
        var params = { };
        Object.keys(criteria).forEach(function (key) {
          if (criteria[key] && criteria[key] !== '') {
            params[key] = criteria[key];
          }
        });
        var deferred = $q.defer();
        $http({
          url: ClientService.getBasePath() + '/clients',
          params: {
            limit: pageAndSort.limit,
            offset: (pageAndSort.page - 1) * 25,
            filter: serialize(params),
            sort: pageAndSort.sort
          }
        }).then(function (response) {
          deferred.resolve(response.data.result);
        }).catch(function (error) {
          ClientService.handleError(error, deferred);
        });
        return deferred.promise;
      };

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
