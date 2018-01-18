'use strict';

angular.module('supportAdminApp')
  .factory('ChallengeService', ['$q', '$http', 'API_URL',
    function($q, $http, API_URL) {

      var service = {
        findChallengeById: findChallengeById,
        getChallengePhases: getChallengePhases,
        updateChallengeFixedFee: updateChallengeFixedFee,
        updateChallengePercentageFee: updateChallengePercentageFee,
      }

      return service;

      /**
       * helper function to process http request
       */
      function _processRequest(request) {
        return request.then(
          function(response) {
            if (response.data.result.content || response.data.result.content.length > 0) {
              return response.data.result.content.length > 0 ? response.data.result.content[0] : response.data.result.content;
            } else {
              var err;
              err = {
                status: 404,
              };
              return $q.reject(err);
            }
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
       * Find challenge identified by Challenge Id
       * @param challengeId
       * @returns {Promise}
       */
      function findChallengeById(challengeId) {
        if (!challengeId) {
          return $q.reject({
            error: 'Challenge ID must be specified.'
          });
        }

        var request = $http({
          method: 'GET',
          url: API_URL + '/v3/challenges/?filter=id%3D' + challengeId,
          headers: {
            "Content-Type": "application/json"
          }
        });
        return _processRequest(request);
      };

      /**
       * Retrieve challenge phases
       * @param challengeId
       * @returns {Promise}
       */
      function getChallengePhases(challengeId) {
        if (!challengeId) {
          return $q.reject({
            error: 'Challenge ID must be specified.'
          });
        }
        var request = $http({
          method: 'GET',
          url: API_URL + '/v3/challenges/' + challengeId + '/phases/',
          headers: {
            "Content-Type": "application/json"
          }
        });
        return request.then(
          function (response) {
            if (Array.isArray(response.data.result.content) && response.data.result.content.length > 0) {
              var phases = [];
              _(response.data.result.content).forEach(function (p) {
                // adding space seperated phase info for backward compatibility.
                var submittablePhases = [
                  'SUBMISSION',
                  'CHECKPOINT_SUBMISSION', 'CHECKPOINT SUBMISSION',
                  'FINAL_FIX', 'FINAL FIX',
                ];
                if (_.indexOf(submittablePhases, p.phaseType.toUpperCase()) > -1) {
                  // updating phase type to match constants.
                  // This can be revmoved once challenge service uses 'constants'
                  p.phaseType = p.phaseType.replace(/\s+/g, "_").toUpperCase();
                  p.actualEndTime /= 1000;
                  p.scheduledEndTime /= 1000;
                  p.scheduledStartTime /= 1000;
                  p.actualStartTime /= 1000;
                  p.fixedStartTime /= 1000;
                  phases.push({
                    name: p.phaseType,
                    value: p
                  });
                }
              });
              return phases;

            } else {
              return $q.reject("Challenge phases not found");
            }
          },
          function (error) {
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
       * Update Challenge Fixed Fee
       * @param challenge object
       */
      function updateChallengeFixedFee(challenge) {

        var request = $http({
          method: 'PUT',
          url: API_URL + '/v3/challenges/' + challenge.id,
          data:  JSON.stringify({
            param: {
              fixedFee: challenge.fixedFee
            }
          }),
          headers: {
            "Content-Type": "application/json"
          }
        });

        return _processRequest(request);
      };

      /**
       * Update Challenge Percentage Fee
       * @param challenge object
       */
      function updateChallengePercentageFee(challenge) {

        var request = $http({
          method: 'PUT',
          url: API_URL + '/v3/challenges/' + challenge.id,
          data:  angular.toJson({
            param: {
              percentageFee: challenge.percentageFee
            }
          }),
          headers: {
            "Content-Type": "application/json"
          }
        });

        return _processRequest(request);
      };

    }]);

