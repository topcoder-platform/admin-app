'use strict';

angular.module('supportAdminApp')
  .factory('BillingAccountService', ['$log', '$q','$http', 'API_URL', 'API_VERSION_PATH',
    function ($log, $q, $http, API_URL, API_VERSION_PATH) {
      var BillingAccountService = { };

      /**
       * Handle API response error
       * @param  {Error}      error           the error as received in catch callback
       * @param  {Object}     deferred        the deferred object
       */
      BillingAccountService.handleError = function(error, deferred) {
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

      BillingAccountService.getBasePath = function () {
        return API_URL + '/' + API_VERSION_PATH;
      }

      /**
       * Search billing accounts
       */
      BillingAccountService.search = function(criteria) {
        var deferred = $q.defer();
        var params = { };
        Object.keys(criteria).forEach(function (key) {
          if (criteria[key] && criteria[key] !== '') {
            params[key] = criteria[key];
          }
        });
        $http({
          url: BillingAccountService.getBasePath() + '/billing-accounts',
          params: params
        }).then(function (response) {
          deferred.resolve(response.data.result.content);
        }).catch(function (error) {
          BillingAccountService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      BillingAccountService.createBillingAccount = function (entity) {
        var deferred = $q.defer();
        $http({
          method: 'POST',
          data: {
            param: entity
          },
          headers: {
            'Content-Type': 'application/json'
          },
          url: BillingAccountService.getBasePath() + '/billing-accounts',
        }).then(function (response) {
          deferred.resolve(response.data.result.content);
        }).catch(function (error) {
          BillingAccountService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      BillingAccountService.editBillingAccount = function (id, entity) {
        var deferred = $q.defer();
        $http({
          method: 'PATCH',
          data: {
            param: entity
          },
          headers: {
            'Content-Type': 'application/json'
          },
          url: BillingAccountService.getBasePath() + '/billing-accounts/' + id,
        }).then(function (response) {
          deferred.resolve(response.data.result.content);
        }).catch(function (error) {
          BillingAccountService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      BillingAccountService.findBillingAccountById = function(id) {
        var deferred = $q.defer();
        $http({
          url: BillingAccountService.getBasePath() + '/billing-accounts/' + id,
        }).then(function (response) {
          deferred.resolve(response.data.result.content);
        }).catch(function (error) {
          BillingAccountService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      return BillingAccountService;
    }]);
