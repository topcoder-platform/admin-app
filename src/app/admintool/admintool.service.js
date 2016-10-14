'use strict';

angular.module('supportAdminApp')
  .factory('AdminToolService', ['$log', '$q', '$http', 'ADMIN_TOOL_URL', 'API_URL', 'API_VERSION_PATH',
    function ($log, $q, $http, ADMIN_TOOL_URL, API_URL, API_VERSION_PATH) {
      var service = {
        getV2Token: getV2Token,
        findAdmins: findAdmins,
        createAdmin: createAdmin,
        deleteAdmin: deleteAdmin,
        findCopilots: findCopilots,
        createCopilot: createCopilot,
        deleteCopilot: deleteCopilot,
        updateCopilot: updateCopilot,
        findReviewers: findReviewers,
        createReviewer: createReviewer,
        deleteReviewer: deleteReviewer,
        updateReviewer: updateReviewer,
        findReviewBoardProjectCategories: findReviewBoardProjectCategories
      };

      /**
       * Get v2 token with v3 token
       */
      function getV2Token() {
        return $http({
          method: 'GET',
          url: API_URL + '/' + API_VERSION_PATH + '/authorizations/1'
        }).then(
          function (response) {
            $log.debug(response);
            if (response.data && response.data.result && response.data.result.content
              && response.data.result.content.externalToken) {
              return response.data.result.content.externalToken;
            } else {
              return $q.reject({
                error: 'Cannot find v2 token in response.'
              });
            }
          },
          function (error) {
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
          }
        );
      }

      /**
       * helper function to process http request
       */
      var _processRequest = function (request, key) {
        return request.then(
          function (response) {
            var data = response.data && key && response.data[key] ? response.data[key] : response.data;
            // only two requests to get review board categories actually
            if (Array.isArray(response) && response.length === 2 && Array.isArray(response[0].data) && Array.isArray(response[1].data)) {
              data = response[0].data.concat(response[1].data);
            }
            if (data && data.success === false) {
              return $q.reject({
                error: data.message || 'Unknown server error'
              });
            } else if (data && data.error) {
              return $q.reject({
                error: data.error
              });
            } else {
              return data;
            }
          },
          function (error) {
            $log.error(error);
            var err;
            if (error && error.data && error.data.error) {
              err = {
                status: error.status,
                error: error.data.error.details || error.data.error.description || error.data.error.name
              };
            }
            if (!err) {
              err = {
                status: error.status,
                error: error.statusText || 'Please make sure tc api server is running'
              };
            }
            return $q.reject(err);
          }
        );
      };


      /**
       * Find admins
       */
      function findAdmins(token) {
        var request = $http({
          method: 'GET',
          url: ADMIN_TOOL_URL + '/admin/admins',
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          }
        });
        return _processRequest(request, 'allAdmins');
      }

      /**
       * creates admin user
       */
      function createAdmin(token, data) {
        var request = $http({
          method: 'POST',
          url: ADMIN_TOOL_URL + '/admin/admins',
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          data: angular.toJson(data)
        });
        return _processRequest(request);
      }

      /**
       * Delete an existing admin user
       */
      function deleteAdmin(token, data) {
        var request = $http({
          method: "DELETE",
          url: ADMIN_TOOL_URL + "/admin/admins",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          data: angular.toJson(data)
        });
        return _processRequest(request);
      }


      /**
       * Find copilots
       */
      function findCopilots(token) {
        var request = $http({
          method: 'GET',
          url: ADMIN_TOOL_URL + '/admin/copilots',
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          }
        });
        return _processRequest(request, 'allCopilots');
      }

      /**
       * creates copilot
       */
      function createCopilot(token, data) {
        var request = $http({
          method: 'POST',
          url: ADMIN_TOOL_URL + '/admin/copilots',
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          data: angular.toJson(data)
        });
        return _processRequest(request);
      }

      /**
       * Delete copilot
       */
      function deleteCopilot(token, data) {
        var request = $http({
          method: "DELETE",
          url: ADMIN_TOOL_URL + "/admin/copilots",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          data: angular.toJson(data)
        });
        return _processRequest(request);
      }

      /**
       * Update copilot
       */
      function updateCopilot(token, data) {
        return deleteCopilot(token, data).then(function () {
          return createCopilot(token, data);
        });
      }


      /**
       * Find Reviewers
       */
      function findReviewers(token, categoryId) {
        var request = $http({
          method: 'GET',
          url: ADMIN_TOOL_URL + '/admin/reviewers',
          params: {
            categoryId: categoryId
          },
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          }
        });
        return _processRequest(request, 'reviewers');
      }


      /**
       * creates Reviewer
       */
      function createReviewer(token, data) {
        var request = $http({
          method: 'POST',
          url: ADMIN_TOOL_URL + '/admin/reviewers',
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          data: angular.toJson(data)
        });
        return _processRequest(request);
      }

      /**
       * Delete Reviewer
       */
      function deleteReviewer(token, data) {
        var request = $http({
          method: "DELETE",
          url: ADMIN_TOOL_URL + "/admin/reviewers",
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          },
          data: angular.toJson(data)
        });
        return _processRequest(request);
      }


      /**
       * Update Reviewer
       */
      function updateReviewer(token, oldReviewer, newReviewer) {
        var requests = [deleteReviewer(token, oldReviewer)];
        if (oldReviewer.categoryId !== newReviewer.categoryId) {
          requests.push(deleteReviewer(token, {
            username: newReviewer.username,
            categoryId: newReviewer.categoryId
          }).catch(function (error) {
            // new reviewer role may not exist
            if (error.status !== 404) {
              return $q.reject(error);
            }
          }));
        }
        return $q.all(requests).then(function () {
          delete newReviewer.id;
          return createReviewer(token, newReviewer)
        });
      }

      /**
       * Find review board project categories
       */
      function findReviewBoardProjectCategories(token) {
        var request = $q.all([$http({
          method: 'GET',
          url: ADMIN_TOOL_URL + '/develop/challengetypes',
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          }
        }), $http({
          method: 'GET',
          url: ADMIN_TOOL_URL + '/design/challengetypes',
          headers: {
            "Content-Type": "application/json",
            "Authorization": "Bearer " + token
          }
        })]);
        return _processRequest(request);
      }

      return service;
    }]);
