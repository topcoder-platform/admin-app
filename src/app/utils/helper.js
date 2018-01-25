'use strict';

angular
  .module('supportAdminApp')
  .factory('helper', [
    '$log',
    '$q',
    function ($log, $q) {
      var helper = {};

      /**
       * Handles an API error response.
       * @param {Object} error The error
       */
      helper.handleError = function (error) {
        $log.error(error);
        var err;
        if (error && error.data) {
          err = {
            status: error.status
          };
          err.error = error.data.result
            ? error.data.result.content
            : error.data.message;

        }
        if (!err) {
          err = {
            status: error.status,
            error: error.statusText
          };
        }

        return $q.reject(err);
      }

      return helper;
    }
  ]);