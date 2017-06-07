'use strict';

angular.module('supportAdminApp')
  .factory('BillingAccountResourceService', ['$log', '$q','$http', 'API_URL', 'API_VERSION_PATH',
    function ($log, $q, $http, API_URL, API_VERSION_PATH) {
      var BillingAccountResourceService = { };

      /**
       * Handle API response error
       * @param  {Error}      error           the error as received in catch callback
       * @param  {Object}     deferred        the deferred object
       */
      BillingAccountResourceService.handleError = function(error, deferred) {
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
        }
        if(!err) {
          err = {
            status: error.status,
            error : error.message
          };
        }
        deferred.reject(err);
      }

      BillingAccountResourceService.getBasePath = function () {
        return API_URL + '/' + API_VERSION_PATH;
      }

      /**
       * Get a list of all the billing account resources
       */
      BillingAccountResourceService.findAll = function(accountId) {
        var deferred = $q.defer();
        $http({
          url: BillingAccountResourceService.getBasePath() + '/billing-accounts/' + accountId + '/users',
        }).then(function (response) {
          deferred.resolve(response.data.result.content);
        }).catch(function (error) {
          BillingAccountResourceService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      BillingAccountResourceService.createBillingAccountResource = function (accountId, entity) {
        var deferred = $q.defer();
        $http({
          method: 'POST',
          data: angular.toJson({
            param: {
              userId: entity.userId
            }
          }),
          headers: {
            'Content-Type': 'application/json'
          },
          url: BillingAccountResourceService.getBasePath() + '/billing-accounts/' + accountId + '/users',
        }).then(function (response) {
          deferred.resolve(response.data.result.content);
        }).catch(function (error) {
          BillingAccountResourceService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      BillingAccountResourceService.removeBillingAccountResource = function (accountId, resourceId) {
        var deferred = $q.defer();
        $http({
          method: 'DELETE',
          url: BillingAccountResourceService.getBasePath() + '/billing-accounts/' + accountId + '/users/' + resourceId,
        }).then(function (response) {
          deferred.resolve(response);
        }).catch(function (error) {
          BillingAccountResourceService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      BillingAccountResourceService.findBillingAccountById = function(accountId, resourceId) {
        var deferred = $q.defer();
        $http({
          url: BillingAccountResourceService.getBasePath() + '/billing-accounts/' + accountId + '/users/' + resourceId,
        }).then(function (response) {
          deferred.resolve(response.data.result.content);
        }).catch(function (error) {
          BillingAccountResourceService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      return BillingAccountResourceService;
    }]);
