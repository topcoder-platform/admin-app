'use strict';

angular
  .module('supportAdminApp')
  .factory('UserService', [
    '$log',
    '$q',
    '$http',
    'User',
    'API_URL',
    'API_VERSION_PATH',
    'helper',
    'MEMBER_V5_API_URL',
    function ($log, $q, $http, User, API_URL, API_VERSION_PATH, helper, MEMBER_V5_API_URL) {
      // local dev var API_URL = 'http://localhost:8080'; The base path
      // of the API including version.
      var basePath = API_URL + '/' + API_VERSION_PATH;

      // The default headers.
      var defaultHeaders = {
        "Content-Type": "application/json"
      };

      var UserService = {};

      /** find user by ID */
      UserService.findById = function (userId) {
        if (!userId) {
          return $q.reject({ error: 'userId must be specified.' });
        }

        var request = $http({
          method: 'GET',
          url: API_URL + '/v3/users/' + userId,
          headers: defaultHeaders
        });

        return request.then(function (response) {
          $log.debug(response);
          return UserService.createUser(response.data.result.content);
        }, helper.handleError);
      }; // findById()

      /** find users */
      UserService.find = function (options) {
        var opts = options || {};
        var query = "";
        angular.forEach({
          "fields": opts.fields || "id,handle,email,active,emailActive,status,credential,firstName,lastName,createdA" +
            "t,modifiedAt",
          "filter": opts.filter,
          "limit": opts.limit,
          //"offset": null, "orderBy": null,
        }, function (value, key) {
          if (value) {
            query += ('&' + key + '=' + encodeURIComponent(value));
          }
        });

        var request = $http({
          method: 'GET',
          url: API_URL + '/v3/users?' + query,
          headers: defaultHeaders
        });

        return request.then(function (response) {
          $log.debug(response);
          return UserService.createUser(response.data.result.content);
        }, helper.handleError);
      }; // find()

      /**
       * activates user
       */
      UserService.activate = function (activationCode) {

        var request = $http({
          method: 'PUT',
          url: API_URL + '/v3/users/activate?code=' + activationCode,
          headers: defaultHeaders,
          data: {}
        });

        return request.then(function (response) {
          $log.debug(response);
          return UserService.createUser(response.data.result.content);
        }, function (error) {
          $log.error(error);
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
        });
      }; // activate()

      /**
       * updates a user handle
       */
      UserService.updateHandle = function (userId, handle) {
        var payload = JSON.stringify({
          param: {
            handle: handle
          }
        });
        var request = $http({
          method: 'PATCH',
          url: API_URL + '/v3/users/' + userId + '/handle',
          headers: defaultHeaders,
          data: payload
        });

        return request.then(function (response) {
          $log.debug(response);
          return UserService.createUser(response.data.result.content);
        }, helper.handleError);
      }; // updateHandle()

      UserService.updateEmail = function (userId, email) {
        var payload = JSON.stringify({
          param: {
            email: email
          }
        });
        var request = $http({
          method: 'PATCH',
          url: API_URL + '/v3/users/' + userId + '/email',
          headers: defaultHeaders,
          data: payload
        });

        return request.then(function (response) {
          $log.debug(response);
          return UserService.createUser(response.data.result.content);
        }, helper.handleError);
      }, // updateEmail()

        /**
         *  updates a user status
         */
        UserService.updateStatus = function (userId, status, comment) {

          var payload = JSON.stringify({
            param: {
              status: status
            }
          }),
            param = comment
              ? '?comment=' + encodeURIComponent(comment)
              : '',
            request = $http({
              method: 'PATCH',
              url: API_URL + '/v3/users/' + userId + '/status' + param,
              headers: defaultHeaders,
              data: payload
            });

          return request.then(function (response) {
            $log.debug(response);
            return UserService.createUser(response.data.result.content);
          }, helper.handleError);
        }; // updateStatus()

      /** get achievements for the specified user id */
      UserService.getAchievements = function (userId) {
        if (!userId) {
          return $q.reject({ error: 'userId must be specified.' });
        }

        var request = $http({
          method: 'GET',
          url: API_URL + '/v3/users/' + userId + '/achievements',
          headers: defaultHeaders
        });

        return request.then(function (response) {
          $log.debug(response);
          return response.data.result.content;
        }, function (error) {
          $log.error(error);
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
        });
      }; // getAchievements()

      /**
       * Instantiate a user object(s)
       */
      UserService.createUser = function (data) {
        if (angular.isArray(data)) {
          var result = [];
          angular.forEach(data, function (elem) {
            result.push(User.createInstance(elem));
          });
          return result;
        } else {
          return User.createInstance(data);
        }
      };

      /** get profile by handle */
      UserService.getProfile = function (handle) {
        if (!handle) {
          return $q.reject({ error: 'handle must be specified.' });
        }

        var request = $http({
          method: 'GET',
          url: API_URL + '/' + API_VERSION_PATH + '/members/' + handle,
          headers: defaultHeaders
        });

        return request.then(function (response) {
          $log.debug(response);
          return response.data.result.content;
        }, function (error) {
          $log.error(error);
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
        });
      }; // findById()

      UserService.getProfileEndpoint = function (handle) {
        return API_URL + '/' + API_VERSION_PATH + '/members/' + handle;
      }

      /**
       * Creates or updates the user SSO profile
       * @param {Integer} userId The userId
       * @param {Object} profile The user SSO profile.
       */
      UserService.createOrUpdateSSOUserLogin = function (userId, profile) {
        var payload = JSON.stringify({ param: profile });
        var request = $http({
          method: 'POST',
          url: API_URL + '/v3/users/' + userId + '/createOrUpdateSSOUserLogin',
          headers: defaultHeaders,
          data: payload
        });

        return request.then(function (response) {
          $log.debug(response);
          return response.data;
        }, helper.handleError);
      };

      /**
       * Get SSO login providers.
       * @returns {Array} The SSO login providers.
       */
      UserService.getSsoLoginProviders = function () {
        var request = $http({
          method: 'GET',
          url: API_URL + '/v3/ssoLoginProviders',
          headers: defaultHeaders
        });

        return request.then(function (response) {
          $log.debug(response);
          return response.data.result.content;
        }, helper.handleError);
      };

      /**
       * Get SSO user logins.
       * @param {Integer} userId The userId.
       * @returns {Array} The SSO user logins.
       */
      UserService.getSsoUserLogins = function (userId) {
        var request = $http({
          method: 'GET',
          url: basePath + '/users/' + userId + '/SSOUserLogins',
          headers: defaultHeaders
        });

        return request.then(function (response) {
          $log.debug(response);
          return response.data.result.content;
        }, helper.handleError);
      };

      /**
       * Create a SSO user login.
       * @param {Integer} userId The userId.
       * @param {Object} userLogin The user login.
       * @returns {Object} The created user login.
       */
      UserService.createSsoUserLogin = function (userId, userLogin) {

        var payload = JSON.stringify({ param: userLogin });

        var request = $http({
          method: 'POST',
          url: basePath + '/users/' + userId + '/SSOUserLogin',
          headers: defaultHeaders,
          data: payload
        });

        return request.then(function (response) {
          $log.debug(response);
          return response.data.result.content;
        }, helper.handleError);
      };

      /**
       * Updates a SSO user login.
       * @param {Integer} userId The userId.
       * @param {Object} userLogin The user login.
       * @returns {Object} The updated user login.
       */
      UserService.updateSsoUserLogin = function (userId, userLogin) {

        var payload = JSON.stringify({ param: userLogin });

        var request = $http({
          method: 'PUT',
          url: basePath + '/users/' + userId + '/SSOUserLogin',
          headers: defaultHeaders,
          data: payload
        });

        return request.then(function (response) {
          $log.debug(response);
          return response.data.result.content;
        }, helper.handleError);
      };

      /**
       * Deletes a SSO user login.
       * @param {Integer} userId The userId.
       * @param {string} provider The SSO provider.
       * @returns {Object} The updated user login.
       */
      UserService.deleteSsoUserLogin = function (userId, provider) {
        var request = $http({
          method: 'DELETE',
          url: basePath + '/users/' + userId + '/SSOUserLogin?provider=' + provider,
          headers: defaultHeaders,
        });

        return request.then(function (response) {
          $log.debug(response);
          return response.data.result.content;
        }, helper.handleError);
      };

      /**
       * Gets the user by handle filter.
       * @param {string} handle the handle.
       * @returns {Array} the handle info array.
       */
      UserService.getUserByHandleFilter = function (handle) {
        var request = $http({
          method: 'GET',
          url: basePath + '/users?fields=id,handle&filter=handle=' + handle
        });
        return request.then(function (response) {
          return response.data.result.content
        }, helper.handleError)
      }

      /**
       * gets the member suggest by handle.
       * @param {string} handle the handle.
       */
      UserService.getMemberSuggestByHandle = function (handle) {
        var request = $http({
          method: 'GET',
          url: basePath + '/members/_suggest/' + handle
        });
        return request.then(function (response) {
          return response.data.result.content
        }, helper.handleError)
      };

      /**
       * gets a list of members given a list of handles.
       * @param {Array} handles the handle.
       */
      UserService.getMembersByHandle = function (handles) {
        var qs = "";
        handles.forEach(function(handle) {
          qs += "&handlesLower[]=" + handle.toLowerCase();
        })
        var request = $http({
          method: 'GET',
          url: MEMBER_V5_API_URL +'/members?fields=userId,handle' + qs
        });
        return request.then(function (response) {
          return response.data;
        }, helper.handleError)
      };

      return UserService;
    }
  ]);
