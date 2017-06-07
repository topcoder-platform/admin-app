'use strict';

angular.module('supportAdminApp')
  .factory('UserService', ['$log', '$q', '$http', 'User', 'API_URL', 'API_VERSION_PATH',
    function ($log, $q, $http, User, API_URL, API_VERSION_PATH) {
      // local dev
      //var API_URL = 'http://local.topcoder-dev.com:8080';

      var UserService = {};

      /** find user by ID */
      UserService.findById = function(userId) {
        if(!userId) {
          return $q.reject({error : 'userId must be specified.'});
        }

        var request = $http({
          method: 'GET',
          url: API_URL + '/v3/users/' + userId,
          headers: {
            "Content-Type":"application/json"
          }
        });

        return request.then(
          function(response) {
            $log.debug(response);
            return UserService.createUser(response.data.result.content);
          },
          function(error) {
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
            return $q.reject(err);
          }
        );
      }; // findById()


      /** find users */
      UserService.find = function(options) {
        var opts = options || {};
        var query = "";
        angular.forEach({
          "fields": opts.fields || "id,handle,email,active,emailActive,status,credential,firstName,lastName,createdAt,modifiedAt",
          "filter": opts.filter
        //"limit" : null,
        //"offset": null,
        //"orderBy": null,
        }, function(value, key) {
          query += ('&' + key + '=' + encodeURIComponent(value));
        });

        var request = $http({
          method: 'GET',
          url: API_URL + '/v3/users?' + query,
          headers: {
            "Content-Type":"application/json"
          }
        });

        return request.then(
          function(response) {
            $log.debug(response);
            return UserService.createUser(response.data.result.content);
          },
          function(error) {
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
            return $q.reject(err);
          }
        );
      }; // find()

      /**
       * activates user
       */
      UserService.activate = function(activationCode) {

        var request = $http({
          method: 'PUT',
          url: API_URL + '/v3/users/activate?code=' + activationCode,
          headers: {
            "Content-Type":"application/json"
          },
          data: {}
        });

        return request.then(
          function(response) {
            $log.debug(response);
            return UserService.createUser(response.data.result.content);
          },
          function(error) {
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
            return $q.reject(err);
          }
        );
      }; // activate()

      /**
       * updates a user handle
       */
      UserService.updateHandle = function(userId, handle) {
        var payload = JSON.stringify({ param: { handle: handle } });
        var request = $http({
          method: 'PATCH',
          url: API_URL + '/v3/users/'+userId+'/handle',
          headers: {
            "Content-Type":"application/json"
          },
          data: payload
        });

        return request.then(
          function(response) {
            $log.debug(response);
            return UserService.createUser(response.data.result.content);
          },
          function(error) {
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
            return $q.reject(err);
          }
        );
      }; // updateHandle()

      UserService.updateEmail = function(userId, email) {
        var payload = JSON.stringify({ param: { email: email } });
        var request = $http({
          method: 'PATCH',
          url: API_URL + '/v3/users/'+userId+'/email',
          headers: {
            "Content-Type":"application/json"
          },
          data: payload
        });

        return request.then(
          function(response) {
            $log.debug(response);
            return UserService.createUser(response.data.result.content);
          },
          function(error) {
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
            return $q.reject(err);
          }
        );
      }, // updateEmail()

      /**
       *  updates a user status
       */
      UserService.updateStatus = function(userId, status, comment) {

        var payload = JSON.stringify({ param: { status: status } }),
            param = comment ? '?comment=' + encodeURIComponent(comment) : '',
            request = $http({
          method: 'PATCH',
          url: API_URL + '/v3/users/'+userId+'/status'+param,
          headers: {
            "Content-Type":"application/json"
          },
          data: payload
        });

        return request.then(
          function(response) {
            $log.debug(response);
            return UserService.createUser(response.data.result.content);
          },
          function(error) {
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
            return $q.reject(err);
          }
        );
      }; // updateStatus()

      /** get achievements for the specified user id */
      UserService.getAchievements = function(userId) {
        if(!userId) {
          return $q.reject({error : 'userId must be specified.'});
        }

        var request = $http({
          method: 'GET',
          url: API_URL + '/v3/users/' + userId + '/achievements',
          headers: {
            "Content-Type":"application/json"
          }
        });

        return request.then(
          function(response) {
            $log.debug(response);
            return response.data.result.content;
          },
          function(error) {
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
            return $q.reject(err);
          }
        );
      }; // getAchievements()

      /**
       * Instantiate a user object(s)
       */
      UserService.createUser = function(data) {
        if(angular.isArray(data)) {
          var result = [];
          angular.forEach(data, function(elem){
            result.push(User.createInstance(elem));
          });
          return result;
        } else {
          return User.createInstance(data);
        }
      };


      /** get profile by handle */
      UserService.getProfile = function(handle) {
        if(!handle) {
          return $q.reject({error : 'handle must be specified.'});
        }

        var request = $http({
          method: 'GET',
          url: API_URL + '/'+API_VERSION_PATH+'/members/' + handle,
          headers: {
            "Content-Type":"application/json"
          }
        });

        return request.then(
          function(response) {
            $log.debug(response);
            return response.data.result.content;
          },
          function(error) {
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
            return $q.reject(err);
          }
        );
      }; // findById()

      UserService.getProfileEndpoint = function(handle) {
        return API_URL + '/'+API_VERSION_PATH+'/members/' + handle;
      }

      return UserService;
    }]);
