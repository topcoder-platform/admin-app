'use strict';

angular.module('supportAdminApp')
  .factory('BillingAccountService', ['$log', '$q','$http', 'BILLING_ACCOUNT_API_URL', 'BILLING_ACCOUNT_API_VERSION_PATH',
    function ($log, $q, $http, BILLING_ACCOUNT_API_URL, BILLING_ACCOUNT_API_VERSION_PATH) {
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
        return BILLING_ACCOUNT_API_URL + '/api/' + BILLING_ACCOUNT_API_VERSION_PATH;
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
          url: BillingAccountService.getBasePath() + '/billingaccounts',
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
          url: BillingAccountService.getBasePath() + '/billingaccounts',
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
          url: BillingAccountService.getBasePath() + '/billingaccounts/' + id,
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
          url: BillingAccountService.getBasePath() + '/billingaccounts/' + id,
        }).then(function (response) {
          deferred.resolve(response.data.result.content);
        }).catch(function (error) {
          BillingAccountService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      return BillingAccountService;
    }]);