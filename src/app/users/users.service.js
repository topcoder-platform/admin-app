'use strict';

angular.module('supportAdminApp')
  .factory('UserService', ['$q','$http', 'API_URL',
    function ($q, $http, API_URL) {
      // local dev
      //var API_URL = 'http://local.topcoder-dev.com:8080';
      return ({

        /** find user by ID */
        findById: function(userId) {
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
              console.log(response);
              return response.data.result.content;
            },
            function(error) {
              console.log(error);
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
        }, // findById()


        /** find users */
        find: function(options) {
          var opts = options || {};
          var query = "";
          angular.forEach({
            "fields": opts.fields || "id,handle,email,active,status,credential,firstName,lastName,createdAt,modifiedAt",
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
              console.log(response);
              return response.data.result.content;
            },
            function(error) {
              console.log(error);
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
        }, // find()

        activate: function(activationCode) {

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
              console.log(response);
              return response.data.result.content;
            },
            function(error) {
              console.log(error);
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
        }, // activate()

        updateHandle: function(userId, handle) {
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
              console.log(response);
              return response.data.result.content;
            },
            function(error) {
              console.log(error);
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
        }, // updateHandle()

        updateEmail: function(userId, email) {
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
              console.log(response);
              return response.data.result.content;
            },
            function(error) {
              console.log(error);
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
        
        updateStatus: function(userId, status, comment) {

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
              console.log(response);
              return response.data.result.content;
            },
            function(error) {
              console.log(error);
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
        } // updateStatus()
      });
    }]);
