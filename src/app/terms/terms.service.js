'use strict';

angular.module('supportAdminApp')
  .factory('TermsService', ['$log', '$q','$http', 'TERMS_V5_API_URL',
    function ($log, $q, $http, TERMS_V5_API_URL) {
      var TermsService = { };

      /**
       * Handle API response error
       * @param  {Error}      error           the error as received in catch callback
       * @param  {Object}     deferred        the deferred object
       */
      TermsService.handleError = function(error, deferred) {
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
      TermsService.getBasePath = function() {
        return TERMS_V5_API_URL;
      };

      
      /**
       * Search the list of terms of use
       * @param  {Object} options    the search criteria including filter and pagination params
       */
      TermsService.search = function(options) {
        var deferred = $q.defer();

        $http({
          method: 'GET',
          url: TermsService.getBasePath() + '/terms?' + options.filter,
          headers: {
            'Content-Type': 'application/json'
          }
        }).then(function (response) {
          var data = {
            result: response.data.result,
            totalCount: response.headers('x-total')
          }
          deferred.resolve(data);
        }).catch(function (error) {
          TermsService.handleError(error, deferred);
        });
        return deferred.promise;
      };

      
      /**
       * Create terms of use
       * @param  {Object} entity    the terms of use entity to create
       */
      TermsService.createTerms = function (entity) {
        var deferred = $q.defer();
        $http({
          method: 'POST',
          data: entity,
          headers: {
            'Content-Type': 'application/json'
          },
          url: TermsService.getBasePath() + '/terms',
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          TermsService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      /**
       * Edit the terms of use
       * @param  {String}     id        the uuid of the terms entity to update
       * @param  {Object}     entity    the terms of use entity to update
       */
      TermsService.editTerms = function (id, entity) {
        var deferred = $q.defer();
        $http({
          method: 'PUT',
          data:  entity,
          headers: {
            'Content-Type': 'application/json'
          },
          url: TermsService.getBasePath() + '/terms/' + id,
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          TermsService.handleError(error, deferred);
        });
        return deferred.promise;
      }
      
      /**
       * Find the terms of use by Id
       * @param {String}  id  the uuid of the terms entity to retrieve
       */
      TermsService.findTermsById = function(termsId) {
        var deferred = $q.defer();
        $http({
          url: TermsService.getBasePath() + '/terms/' + termsId,
          params: {
            noauth: true
          }
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          TermsService.handleError(error, deferred);
        });
        return deferred.promise;
      }
      
      /**
       * Delete the terms of use by Id
       * @param {String}  id  the uuid of the terms entity to delete
       */
      TermsService.deleteTerms = function (id) {
        var deferred = $q.defer();
        $http({
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json'
          },
          url: TermsService.getBasePath() + '/terms/' + id,
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          TermsService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      return TermsService;
    }]);
