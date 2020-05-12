'use strict';

/**
 * The notification broadcast service.
 */
angular.module('supportAdminApp').factory('NotificationService', [
  '$q',
  '$http',
  'BUSAPI_URL',
  'API_URL',
  'LOOKUP_V5_API_URL',
  'NOTIFICATIONS_KAFKA_TOPIC',
  'NOTIFCATIONS_EVENT_ORIGINATOR',
  function (
    $q,
    $http,
    BUSAPI_URL,
    API_URL,
    LOOKUP_V5_API_URL,
    NOTIFICATIONS_KAFKA_TOPIC,
    NOTIFCATIONS_EVENT_ORIGINATOR
  ) {
    var service = {
      broadcastNotification: broadcastNotification,
      getAllAvailableSkills: getAllAvailableSkills,
      getAllAvailableCountries: getAllAvailableCountries
    };

    return service;

    /**
     * helper function to process http request
     */
    function _processRequest(request) {
      return request.then(
        function (response) {
          return {status: "Success", message: "Request successfully processed."};
        },
        function (error) {
            var err = {
              status: error.status,
              error: error.statusText,
            };
          return $q.reject(err);
        }
      );
    }

    /**
     * Broadcast the notification to the given recipients.
     * It posts the notification to event bus.
     * @param {String} announcement The announcement to send.
     * @param {Object} recipients The announcement recipients, it has the following format {groups: [], skills: [], tracks:[], countryCodes:[]}
     * @returns {Promise}
     */
    function broadcastNotification(announcement, recipients) {
      if (announcement.length === 0) {
        return $q.reject({
          error: 'The announcement text should not be empty',
        });
      }

      var request = $http({
        method: 'POST',
         url: BUSAPI_URL + '/bus/events',
        data: {
          topic: NOTIFICATIONS_KAFKA_TOPIC,
          originator: NOTIFCATIONS_EVENT_ORIGINATOR,
          timestamp: new Date().toISOString(),
          'mime-type': 'application/json',
          payload: {
            message: announcement,
            recipients: recipients,
          },
        },
        headers: {
          'Content-Type': 'application/json',
        },
      });
      return _processRequest(request); 
    }

    /**
     * Gets all available skills available in the system
     */
    function getAllAvailableSkills() {
      return $http({
        method: 'GET',
        url: API_URL + '/v3/tags/?domain=SKILLS',
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function(response) {
        return $q.resolve(response.data.result.content)
      });
    }

    /**
     * Gets all available countries available in the system
     */
    function getAllAvailableCountries() {
      var allCountries = []
      var deferred = $q.defer()

      fetchCountriesRecursively(1, allCountries, deferred)

      return deferred.promise
    }

    /**
     * Gets the countries from the lookup API recursively.
     * The maximum number of countries to retrieve from the lookup API in a single call is 100.
     * 
     * @param {Number} page The page from which to start retrieving the countries.
     * @param {Array} allCountries The array to hold the list of all retrieved countries.
     * @param {Object} deferred The deferred object
     */
    function fetchCountriesRecursively(page, allCountries, deferred) {
      var promise = $http.get(LOOKUP_V5_API_URL + '/lookups/countries?perPage=100&page='+page, {})
      .then(function(countries) {
        Array.prototype.push.apply(allCountries, countries.data)
        if(countries.data.length === 100) {
          page = page + 1
          fetchCountriesRecursively(page, allCountries, deferred);
        } else {
          deferred.resolve(allCountries);
        }
      });
      return promise
    }
  },
]);

