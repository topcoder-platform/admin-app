'use strict';

angular.module('supportAdminApp')
  .factory('TagService', ['$q', '$http', 'API_URL', '$log',
      function($q, $http, API_URL) {

        var service = {
          findTagById: findTagById,
          findTags: findTags,
          createTag: createTag,
          deleteTag: deleteTag,
          updateTag: updateTag
        };

        /**
         * helper function to process http request
         */
        var _processRequest = function(request) {
          return request.then(
            function(response) {
              return response.data && response.data.result && response.data.result.content ? response.data.result.content: response.data;
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

        return service;
        /**
         * Find tag identified by Id
         */
        function findTagById(id) {
          if (!id) {
            return $q.reject({
              error: 'Tag ID must be specified.'
            });
          }

          var request = $http({
            method: 'GET',
            url: API_URL + '/v3/tags/' + id,
            headers: {
              "Content-Type": "application/json"
            }
          });
          return _processRequest(request);
        }

        /** 
         * Find tags by name, By default loads 50 tags ordered by Name
         */
        function findTags(name) {
          var request = $http({
            method: 'GET',
            url: API_URL + '/v3/tags/'+(name? '?filter=name%3D' + encodeURIComponent(name):''),
            headers: {
              "Content-Type": "application/json"
            }
          });
          return _processRequest(request);
        }

        /**
         * creates a tag
         */
        function createTag(tag) {
          var request = $http({
            method: 'POST',
            url: API_URL + '/v3/tags/',
            headers: {
              "Content-Type": "application/json"
            },
            data: angular.toJson({
              param: tag
            })
          });
          return _processRequest(request);
        }

        /**
         * Update an existing tag
         */
        function updateTag(tag) {
          var request = $http({
            method: "PUT",
            url: API_URL + "/v3/tags/" + tag.id,
            headers: {
              "Content-Type": "application/json"
            },
            data: angular.toJson({
              param: tag
            })
          });
          return _processRequest(request);
        }

        /**
         * Delete an existing tag
         */
        function deleteTag(id) {
          var request = $http({
            method: "DELETE",
            url: API_URL + "/v3/tags/" + id,
            headers: {
              "Content-Type": "application/json"
            }
          });
          return _processRequest(request);
        }
  }
]);
