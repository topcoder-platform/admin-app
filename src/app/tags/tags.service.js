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
          getTechnologyStatuses: getTechnologyStatuses
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
            url: API_URL + "/v3/tags/" + id,
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
            techStatuses = statuses
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
                  'id': _.find(techStatuses, { 'value': technologyTag.status }).id
                }
              }
            })
          });
          return _processRequest(request);
        }

        /**
         * Update an existing technology in informix
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function updateTechnology(technologyTag) {
          var request = $http({
            method: "PATCH",
            url: API_URL + "/v3/technologies/" + technologyTag.informixId,
            headers: {
              "Content-Type": "application/json"
            },
            data: angular.toJson({
              param: {
                'name': technologyTag.name,
                'description': technologyTag.name,
                'status': {
                  'id': _.find(techStatuses, { 'value': technologyTag.status }).id
                }
              }
            })
          });
          return _processRequest(request);
        }

        /**
         * Delete an existing technology in informix
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function deleteTechnology(id) {
          var request = $http({
            method: "DELETE",
            url: API_URL + "/v3/technologies/" + id,
            headers: {
              "Content-Type": "application/json"
            }
          });
          return _processRequest(request);
        }

        /**
         * Creates a platform in informix
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function createPlatform(platformTag) {
          var request = $http({
            method: 'POST',
            url: API_URL + '/v3/platforms/',
            headers: {
              "Content-Type": "application/json"
            },
            data: angular.toJson({
              param: {
                'name': platformTag.name
              }
            })
          });
          return _processRequest(request);
        }

        /**
         * Update an existing platform in informix
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function updatePlatform(platformTag) {
          var request = $http({
            method: "PATCH",
            url: API_URL + "/v3/platforms/" + platformTag.informixId,
            headers: {
              "Content-Type": "application/json"
            },
            data: angular.toJson({
              param: {
                'name': platformTag.name
              }
            })
          });
          return _processRequest(request);
        }

        /**
         * Delete an existing platform in informix
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function deletePlatform(id) {
          var request = $http({
            method: "DELETE",
            url: API_URL + "/v3/platforms/" + id,
            headers: {
              "Content-Type": "application/json"
            }
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
         * Sync technologies.
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function syncTechnologies(tags, technologies, scope) {
          var technologyTags = _.filter(tags, { 'domain': 'technology' });
          var technologyTagsNameMap = _.keyBy(technologyTags, 'name');
          var technologyTagsInformixIdMap = _.keyBy(_.filter(technologyTags, function(tag) {return tag.informixId > 0;}), 'informixId');

          var createTechnologyTagRequests = [];
          var updateTechnologyTagRequests = [];
          var deleteTechnologyTagRequests = [];
          var createTechnologyRequests = [];

          _.forEach(technologies, function(technology) {
            var technologyTag;
            if (technologyTagsInformixIdMap[technology.id]) {
              technologyTag = technologyTagsInformixIdMap[technology.id];
              delete technologyTagsInformixIdMap[technology.id];
              if (technologyTag.name !== technology.name || _.lowerCase(technologyTag.status) !== _.lowerCase(technology.status.description)) {
                // Technology was updated in informix, but not in tags db
                technologyTag.name = technology.name;
                technologyTag.status = _.lowerCase(technology.status.description);
                alertSyncMsg('Sync from informix [Update technology tag]: ' + JSON.stringify(technologyTag), scope);
                updateTechnologyTagRequests.push(updateTag(technologyTag));
              }
            } else if (technologyTagsNameMap[technology.name]) {
              technologyTag = technologyTagsNameMap[technology.name];
              delete technologyTagsNameMap[technology.name];
              // Associate the informix id
              technologyTag.informixId = technology.id;
              technologyTag.status = _.lowerCase(technology.status.description);
              alertSyncMsg('Sync from informix [Associate technology informix id]: ' + JSON.stringify(technologyTag), scope);
              updateTechnologyTagRequests.push(updateTag(technologyTag));
            } else {
              // Technology was created in informix, but not in tags db
              technologyTag = {
                'name': technology.name,
                'domain': 'technology',
                'status': _.lowerCase(technology.status.description),
                'informixId': technology.id
              };
              alertSyncMsg('Sync from informix [Create technology tag]: ' + JSON.stringify(technologyTag), scope);
              createTechnologyTagRequests.push(createTag(technologyTag).then(function(tag) {
                tags.push(tag);
              }));
            }
          });

          _.forEach(technologyTagsInformixIdMap, function(technologyTag) {
            // Technology was deleted in informix, but not in tags db
            alertSyncMsg('Sync from informix [Delete technology tag]: ' + JSON.stringify(technologyTag), scope);
            deleteTechnologyTagRequests.push(deleteTag(technologyTag.id));
          });

          _.forEach(technologyTagsNameMap, function(technologyTag) {
            if (!technologyTag.informixId) {
              // Technology was created in tags db, but not in informix
              alertSyncMsg('Sync into informix [Create technology]: ' + JSON.stringify(technologyTag), scope);
              createTechnologyRequests.push(createTechnology(technologyTag).then(function(technology) {
                technologyTag.informixId = technology.id;
                // Associate the informix id
                alertSyncMsg('Sync from informix [Associate technology informix id]: ' + JSON.stringify(technologyTag), scope);
                return updateTag(technologyTag);
              }));
            }
          });

          return _.concat(createTechnologyTagRequests, updateTechnologyTagRequests, deleteTechnologyTagRequests, createTechnologyRequests);
        }

        /**
         * Sync platforms.
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function syncPlatforms(tags, platforms, scope) {
          var platformTags = _.filter(tags, { 'domain': 'platform' });
          var platformTagsNameMap = _.keyBy(platformTags, 'name');
          var platformTagsInformixIdMap = _.keyBy(_.filter(platformTags, function(tag) {return tag.informixId > 0;}), 'informixId');

          var createPlatformTagRequests = [];
          var updatePlatformTagRequests = [];
          var deletePlatformTagRequests = [];
          var createPlatformRequests = [];

          _.forEach(platforms, function(platform) {
            var platformTag;
            if (platformTagsInformixIdMap[platform.id]) {
              platformTag = platformTagsInformixIdMap[platform.id];
              delete platformTagsInformixIdMap[platform.id];
              if (platformTag.name !== platform.name) {
                // Platform was updated in informix, but not in tags db
                platformTag.name = platform.name;
                alertSyncMsg('Sync from informix [Update platform tag]: ' + JSON.stringify(platformTag), scope);
                updatePlatformTagRequests.push(updateTag(platformTag));
              }
            } else if (platformTagsNameMap[platform.name]) {
              platformTag = platformTagsNameMap[platform.name];
              delete platformTagsNameMap[platform.name];
              // Associate the informix id
              platformTag.informixId = platform.id;
              alertSyncMsg('Sync from informix [Associate platform informix id]: ' + JSON.stringify(platformTag), scope);
              updatePlatformTagRequests.push(updateTag(platformTag));
            } else {
              // Platform was created in informix, but not in tags db
              platformTag = {
                'name': platform.name,
                'domain': 'platform',
                'status': 'approved',
                'informixId': platform.id
              };
              alertSyncMsg('Sync from informix [Create platform tag]: ' + JSON.stringify(platformTag), scope);
              createPlatformTagRequests.push(createTag(platformTag).then(function(tag) {
                tags.push(tag);
              }));
            }
          });

          _.forEach(platformTagsInformixIdMap, function(platformTag) {
            // Platform was deleted in informix, but not in tags db
            alertSyncMsg('Sync from informix [Delete platform tag]: ' + JSON.stringify(platformTag), scope);
            deletePlatformTagRequests.push(deleteTag(platformTag.id));
          });

          _.forEach(platformTagsNameMap, function(platformTag) {
            if (!platformTag.informixId) {
              // Platform was created in tags db, but not in informix
              alertSyncMsg('Sync into informix [Create platform]: ' + JSON.stringify(platformTag), scope);
              createPlatformRequests.push(createPlatform(platformTag).then(function(platform) {
                platformTag.informixId = platform.id;
                // Associate the informix id
                alertSyncMsg('Sync from informix [Associate platform informix id]: ' + JSON.stringify(platformTag), scope);
                return updateTag(platformTag);
              }));
            }
          });

          return _.concat(createPlatformTagRequests, updatePlatformTagRequests, deletePlatformTagRequests, createPlatformRequests);
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
          if (tag.domain === 'platform') {
            return createPlatform(tag).then(function(platform) {
              tag.informixId = platform.id;
              return createTag(tag);
            });
          } else if (tag.domain === 'technology') {
            return createTechnology(tag).then(function(technology) {
              tag.informixId = technology.id;
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
        function updateTagSync(tag) {
          if (tag.previousDomain !== tag.domain) {
            // Domain type changes
            var requests = [];
            if (tag.previousDomain === 'platform' && tag.informixId) {
              requests.push(deletePlatform(tag.informixId));
            } else if (tag.previousDomain === 'technology' && tag.informixId) {
              requests.push(deleteTechnology(tag.informixId));
            }

            if (tag.domain === 'platform') {
              requests.push(createPlatform(tag).then(function(platform) {
                tag.informixId = platform.id;
                return updateTag(tag);
              }));
            } else if (tag.domain === 'technology') {
              requests.push(createTechnology(tag).then(function(technology) {
                tag.informixId = technology.id;
                return updateTag(tag);
              }));
            } else {
              delete tag.informixId;
              requests.push(updateTag(tag));
            }

            return $q.all(requests).then(function(values) {
              return values[values.length - 1];
            });
          } else if (tag.domain === 'platform' && tag.informixId) {
            return updatePlatform(tag).then(function() {
              return updateTag(tag);
            });
          } else if (tag.domain === 'technology' && tag.informixId) {
            return updateTechnology(tag).then(function() {
              return updateTag(tag);
            });
          } else {
            return updateTag(tag);
          }
        }

        /**
         * Deletes a tag and do sync
         * @since ADMIN APP - TAGS MANAGEMENT
         */
        function deleteTagSync(tag) {
          if (tag.domain === 'platform' && tag.informixId) {
            return deletePlatform(tag.informixId).then(function() {
              return deleteTag(tag.id);
            });
          } else if (tag.domain === 'technology' && tag.informixId) {
            return deleteTechnology(tag.informixId).then(function() {
              return deleteTag(tag.id);
            });
          } else {
            return deleteTag(tag.id);
          }
        }
  }
]);
