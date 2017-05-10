'use strict';

angular.module('supportAdminApp')
  .factory('TagService', ['$q', '$http', 'API_URL', '$log',
      function($q, $http, API_URL) {

        var service = {
          findTagById: findTagById,
          findTags: findTags,
          syncTags: syncTags,
          createTagSync: createTagSync,
          deleteTagSync: deleteTagSync,
          updateTagSync: updateTagSync,
          updateTag: updateTag,
          createTag: createTag,
          getTechnologyStatuses: getTechnologyStatuses,
          getTechnologies: getTechnologies,
          getTechnologiesFromInformix: getTechnologiesFromInformix
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
         * Get technologies data from Informix database.
         */
        function getTechnologiesFromInformix() {
          var request = $http({
            method: 'GET',
            url: API_URL + "/v3/technologies"
          });
          return _processRequest(request);
        }

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

        function getTechnologies() {

        }

        /**
         * Update an existing tag
         */
        function updateTag(tag) {
          var request = $http({
            method: "PUT",
            url: API_URL + '/v3/tags/' + tag.id,
            headers: {
              "Content-Type": "application/json"
            },
            data: angular.toJson({
              param: _.omit(tag, ['previousDomain'])
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
            url: API_URL + '/v3/tags/' + id,
            headers: {
              "Content-Type": "application/json"
            }
          });
          return _processRequest(request);
        }

        var techStatuses;
        /** 
         * Get technology statuses
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function getTechnologyStatuses() {
          if (techStatuses) {
            return $q.resolve(techStatuses);
          }
          var request = $http({
            method: 'GET',
            url: API_URL + '/v3/technologyStatuses'
          });
          return _processRequest(request).then(function(statuses) {
            techStatuses = statuses;
            return techStatuses;
          });
        }

        /**
         * Creates a technology in informix
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function createTechnology(technologyTag) {
          var request = $http({
            method: 'POST',
            url: API_URL + '/v3/technologies/',
            headers: {
              "Content-Type": "application/json"
            },
            data: angular.toJson({
              param: {
                'name': technologyTag.name,
                'description': technologyTag.name,
                'status': {
                  'id': technologyTag.status === 'approved' ? 1 : 201
                }
              }
            })
          });
          return _processRequest(request);
        }

        /**
         * Alert sync message.
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function alertSyncMsg(message, scope) {
          console.log(message);
          scope.$broadcast('alert.ClearAll');
          scope.$broadcast('alert.AlertIssued', {
            type: 'info',
            message: message
          });
        }



        /**
         * Sync tags
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function syncTags(scope) {
          return findTags().then(
            function(tags) {
              return $q.all([
                _processRequest($http({
                  method: 'GET',
                  url: API_URL + '/v3/platforms'
                })),
                _processRequest($http({
                  method: 'GET',
                  url: API_URL + '/v3/technologies'
                }))
              ]).then(
                function(values) {
                  var platforms = values[0];
                  var technologies = values[1];

                  var syncRequests = _.concat(syncPlatforms(tags, platforms, scope), syncTechnologies(tags, technologies, scope));

                  if (syncRequests.length === 0) {
                    alertSyncMsg('Tags data are synced with Informix', scope);
                    return tags;
                  }

                  return $q.all(syncRequests).then(
                    function() {
                      alertSyncMsg('Successfully synced tags data with Informix', scope);
                      return tags;
                    }
                  );
                }
              );
            }
          );
        }

        /**
         * Creates a tag and do sync
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function createTagSync(tag) {
          if (tag.domain.indexOf('technologies') !== -1) {
            return createTechnology(tag).then(function() {
              return createTag(tag);
            });
          } else {
            return createTag(tag);
          }
        }

        /**
         * Updates a tag and do sync
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function updateTagSync(tag, originalDomain) {
          var newDomain = tag.domain;
          var originalHaveTechnology = originalDomain.indexOf('technologies') !== -1;
          var newHaveTechnology = newDomain.indexOf('technologies') !== -1;
          var requests = [];
          requests.push(updateTag(tag));
          if (!originalHaveTechnology && newHaveTechnology) {
            requests.push(createTechnology(tag));
          }
          return $q.all(requests);
        }

        /**
         * Deletes a tag and do sync
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function deleteTagSync(tag) {
          return deleteTag(tag.id);
        }
  }
]);
