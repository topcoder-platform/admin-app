'use strict';

angular.module('supportAdminApp')
  .factory('BillingAccountService', ['$log', '$q','$http', 'API_URL', 'API_VERSION_PATH',
    function ($log, $q, $http, API_URL, API_VERSION_PATH) {
      var BillingAccountService = { };

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
      BillingAccountService.handleError = function(error, deferred) {
        console.log(error);
        $log.error(error);
        var err;
        if(error && error.data && error.data.result) {
          err = {
            status: error.status,
            error : error.data.result.content
          };
        } else if (error && error.data) {
          err = {
            status: error.status,
            error : error.data.message
          };
        } else if (error && error.result) {
          err = {
            status: error.status,
            error : error.result.content
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

      BillingAccountService.getBasePath = function () {
        return API_URL + '/' + API_VERSION_PATH;
      }

      function normalizeSavePayload(payload) {
        delete payload.challengeBudgets;
        delete payload.availableBudget;
        payload.clientId = payload.client.id;
        delete payload.client;
        if (payload.startDate && payload.startDate.length) {
          payload.startDate = payload.startDate.substring(0,16) + 'Z';
        }
        if (payload.endDate && payload.endDate.length) {
          payload.endDate = payload.endDate.substring(0,16) + 'Z';
        }
      }

      /**
       * Search billing accounts
       */
      BillingAccountService.search = function(criteria, pageAndSort) {
        if (criteria.startDate && criteria.startDate.length) {
          criteria.startDate = criteria.startDate.substring(0,16) + 'Z';
        }
        if (criteria.endDate && criteria.endDate.length) {
          criteria.endDate = criteria.endDate.substring(0,16) + 'Z';
        }
        var deferred = $q.defer();
        var params = { };
        Object.keys(criteria).forEach(function (key) {
          if (criteria[key] && criteria[key] !== '') {
            params[key] = criteria[key];
          }
        });

        $http({
          url: BillingAccountService.getBasePath() + '/billing-accounts',
          params: {
            limit: pageAndSort.limit,
            offset: (pageAndSort.page - 1) * 25,
            filter: serialize(params),
            sort: pageAndSort.sort
          }
        }).then(function (response) {
          deferred.resolve(response.data.result);
        }).catch(function (error) {
          BillingAccountService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      BillingAccountService.createBillingAccount = function (entity) {
        var request = angular.copy(entity);
        normalizeSavePayload(request);
        request.salesTax = 0;
        if (request.paymentTerms) {
          request.paymentTerms = {
            id: parseInt(request.paymentTerms)
          };
        }
        delete request.customerNumber;
        var deferred = $q.defer();
        $http({
          method: 'POST',
          data: angular.toJson({
            param: request
          }),
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
        entity.paymentTerms = {
          id: 1
        };
        normalizeSavePayload(entity);
        var deferred = $q.defer();
        $http({
          method: 'PATCH',
          data: angular.toJson({
            param: entity
          }),
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
