'use strict';

angular.module('supportAdminApp')
  .factory('ReviewService', ['$log', '$q', '$http', 'API_URL', 'API_VERSION_PATH',
    function($log, $q, $http, API_URL, API_VERSION_PATH) {
      var ReviewService = { };

      /**
       * helper function to process http request
       */
      function _processRequest(request) {
        return request.then(
          function(response) {
            return response.data.result.content;
          },
          function(error) {
            var err;
            if (error && error.data && error.data.result) {
              err = {
                status: error.status,
                error: error.data.result.content
              };
            }
            if (!err) {
              err = {
                status: error.status,
                error: error.statusText
              };
            }
            return $q.reject(err);
          }
        );
      };

      /**
       * Get API Base path
       * @returns {string}
       */
      ReviewService.getBasePath = function () {
        return API_URL + '/' + API_VERSION_PATH;
      }

      /**
       * Search reviews for the challenge
       * @param challengeId
       * @param pageAndSort
       */
      ReviewService.search = function (challengeId, pageAndSort) {
        var deferred = $q.defer();

        $http({
          url: ReviewService.getBasePath() + '/reviews/?filter=challengeId%3D' + challengeId,
          params: {
            limit: pageAndSort.limit,
            offset: (pageAndSort.page - 1) * 25,
            sort: pageAndSort.sort
          }
        }).then(function (response) {
          deferred.resolve(response.data.result);
        }).catch(function (error) {
          ReviewService.handleError(error, deferred);
        });
        return deferred.promise;
      }

      /**
       * Resets the Review of the challenge identified by the given id.
       * @param challengeId
       */
      ReviewService.resetReview = function (challengeId) {
        var request = $http({
          method: 'POST',
          url: API_URL + '/v3/reviews/'+challengeId+'/resetReview',
          headers: {
            "Content-Type": "application/json"
          }
        });

        return _processRequest(request);
      };

      /**
       * Resets the Aggregation of the challenge identified by the given id.
       * @param challengeId
       */
      ReviewService.resetAggregation = function (challengeId) {
        var request = $http({
          method: 'POST',
          url: API_URL + '/v3/reviews/'+challengeId+'/resetAggregation',
          headers: {
            "Content-Type": "application/json"
          }
        });

        return _processRequest(request);
      };

      /**
       * Updates (enable/disable) the autopilot settings for the challenge identified by the given id.
       * @param challengeId
       * @param value boolean
       */
      ReviewService.updateAutopilot = function (challengeId, value) {
        var payload = JSON.stringify({param: { enable: value }}),
          request = $http({
            method: 'POST',
            url: API_URL + '/v3/reviews/'+challengeId+'/updateAutopilot',
            headers: {
              "Content-Type": "application/json"
            },
            data: payload
          });

        return _processRequest(request);
      }

      /**
       *Reopens the Review identified by the given review Id.
       * @param reviewId
       */
      ReviewService.reopenReview = function (reviewId) {
        var request = $http({
          method: 'POST',
          url: API_URL + '/v3/reviews/'+reviewId+'/reopen',
          headers: {
            "Content-Type": "application/json"
          }
        });

        return _processRequest(request);
      };

      /**
       *Deletes the review identified by the given review id.
       * @param reviewId
       */
      ReviewService.deleteReview = function (reviewId) {
        var request = $http({
          method: 'DELETE',
          url: API_URL + '/v3/reviews/'+reviewId,
          headers: {
            "Content-Type": "application/json"
          }
        });

        return _processRequest(request);
      };

      return ReviewService;
    }]);