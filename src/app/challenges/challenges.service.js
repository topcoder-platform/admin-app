'use strict';

angular.module('supportAdminApp')
  .factory('ChallengeService', ['$q', '$http', 'API_URL', 'CHALLENGES_V5_API_URL', 'RESOURCE_V5_API_URL', 'MEMBER_V5_API_URL', '$httpParamSerializer',
    function ($q, $http, API_URL, V5_API_URL, RESOURCE_V5_API_URL, MEMBER_V5_API_URL, $httpParamSerializer) {

      var service = {
        findChallengeById: findChallengeById,
        getChallengePhases: getChallengePhases,
        updateChallengeFixedFee: updateChallengeFixedFee,
        updateChallengePercentageFee: updateChallengePercentageFee,
        v5: {
          search: search,
          getChallengeTypes: getChallengeTypes,
          getChallengeTracks: getChallengeTracks,
          getChallengeById: getChallengeById,
          getChallengeByLegacyId: getChallengeByLegacyId,
          getChallengeResources: getChallengeResources,
          getResourceRoles: getResourceRoles,
          getResourceEmails: getResourceEmails,
          deleteChallengeResource: deleteChallengeResource,
          addChallengeResource: addChallengeResource
        }
      }

      return service;

      /**
       * helper function to process http request
       */
      function _processRequest(request) {
        return request.then(
          function (response) {
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
          data: JSON.stringify({
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
          data: angular.toJson({
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

      /**
      * Handle API response error.
      * @param  {Error}      error           the error as received in catch callback.
      * @param  {Object}     deferred        the deferred object.
      */
      function handleError(error, deferred) {
        var err;
        if (error && error.data) {
          err = {
            status: error.status,
            error: error.data.message
          };
        }
        if (!err) {
          err = {
            status: error.status,
            error: error.message
          };
        }
        deferred.reject(err);
      };

      /**
       * search the challenges using v5 api.
       * @param {string} filter the filter query.
       * @returns {Promise} the promise base api result.
       */
      function search(filter) {
        var deferred = $q.defer();

        $http({
          method: 'GET',
          url: V5_API_URL + '/challenges?' + filter,
          headers: {
            "Content-Type": "application/json"
          }
        }).then(function (response) {
          var data = {
            result: response.data,
            totalCount: response.headers('x-total')
          };
          deferred.resolve(data);
        }).catch(function (error) {
          handleError(error, deferred);
        });
        return deferred.promise;
      };

      /**
       * gets the challenge types.
       * @returns {Promise} the promise base api result.
       */
      function getChallengeTypes() {
        var deferred = $q.defer();

        $http({
          method: 'GET',
          url: V5_API_URL + '/challenge-types?isActive=true',
          headers: {
            "Content-Type": "application/json"
          }
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          handleError(error, deferred);
        });
        return deferred.promise;
      };

      /**
       * gets the challenge tracks.
       * @returns {Promise} the promise base api result.
       */
      function getChallengeTracks() {
        var deferred = $q.defer();

        $http({
          method: 'GET',
          url: V5_API_URL + '/challenge-tracks',
          headers: {
            "Content-Type": "application/json"
          }
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          handleError(error, deferred);
        });
        return deferred.promise;
      };

      /**
       * gets the challenge details by id.
       * @param {string} id the challenge id. 
       * @returns {Promise} the promise base api result.
       */
      function getChallengeById(id) {
        var deferred = $q.defer();

        $http({
          method: 'GET',
          url: V5_API_URL + '/challenges/' + id,
          headers: {
            "Content-Type": "application/json"
          }
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          handleError(error, deferred);
        });
        return deferred.promise;
      };

      /**
       * gets the challenge details by legacyId.
       * Throws an error message if no challenge is found, as of now the api returns 200 and an empty array
       * @param {string} legacyId the challenge legacyId.
       * @returns {Promise} the promise base api result.
       */
      function getChallengeByLegacyId(id) {
        var deferred = $q.defer();

        $http({
          method: 'GET',
          url: V5_API_URL + '/challenges?legacyId=' + id,
          headers: {
            "Content-Type": "application/json"
          }
        }).then(function (response) {
          if (Array.isArray(response.data) && response.data.length > 0)
            deferred.resolve(response.data[0]);
          else throw({"message":" Invalid \"legacyId\""});
        }).catch(function (error) {
          handleError(error, deferred);
        });
        return deferred.promise;
      };

      /**
       * get the challenge resources
       * @param {string} challengeId the challenge id.
       * @returns {Promise} the promise base api result.
       */
      function getChallengeResources(challengeId, filter) {
        var deferred = $q.defer();

        $http({
          method: 'GET',
          url: RESOURCE_V5_API_URL + '/resources?challengeId=' + challengeId + filter,
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Access-Control-Expose-Headers': '*'
          }
        }).then(function (response) {
          var data = {
            result: response.data,
            totalCount: response.headers('x-total')
          };
          deferred.resolve(data);
        }).catch(function (error) {
          handleError(error, deferred);
        });
        return deferred.promise;
      };

      /**
       * get the resource roles.
       * @returns {Promise} the promise base api result.
       */
      function getResourceRoles() {
        var deferred = $q.defer();

        $http({
          method: 'GET',
          url: RESOURCE_V5_API_URL + '/resource-roles',
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          handleError(error, deferred);
        });
        return deferred.promise;
      };

      /**
       * gets a list of e-mails based on a list of users
       * @returns {Promise} the promise with a list of userIds and e-mails.
       */
      function getResourceEmails(users) {
        var deferred = $q.defer();
        var qs = ""
        if (users.length > 1) {
          qs = $httpParamSerializer({
            userIds: users.map(function(user) { return user.memberId })
          });
        } else { // need to check if the list is made of just one user, in this case the qs parameter must be userId instead of userIds
          qs = $httpParamSerializer({
            userId: users.map(function(user) { return user.memberId })
          });
        }

        $http({
          method: 'GET',
          url: MEMBER_V5_API_URL + '/members?' + qs + '&fields=userId,email&perPage=' + users.length,
          headers: {
            'Content-Type': 'application/json',
          }
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          handleError(error, deferred);
        });
        return deferred.promise;
      }

      /**
       * delete the challenge resource.
       * @param {object} data the data.
       * @returns {Promise} the promise base api result.
       */
      function deleteChallengeResource(data) {
        var deferred = $q.defer();

        $http({
          method: 'DELETE',
          url: RESOURCE_V5_API_URL + '/resources',
          headers: {
            'Content-Type': 'application/json',
          },
          data: data
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          handleError(error, deferred);
        });
        return deferred.promise;
      };

      /**
       * add the resource in the challenge.
       * @param {object} data the resource data.
       */
      function addChallengeResource(data) {
        var deferred = $q.defer();

        $http({
          method: 'POST',
          url: RESOURCE_V5_API_URL + '/resources',
          headers: {
            'Content-Type': 'application/json',
          },
          data: data
        }).then(function (response) {
          deferred.resolve(response.data);
        }).catch(function (error) {
          handleError(error, deferred);
        });
        return deferred.promise;
      }
    }]);

