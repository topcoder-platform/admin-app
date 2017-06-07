'use strict';

angular.module('supportAdminApp')
  .factory('AdminToolService', ['$log', '$q', '$http', 'ADMIN_TOOL_URL', 'API_URL', 'API_VERSION_PATH',
    function ($log, $q, $http, ADMIN_TOOL_URL, API_URL, API_VERSION_PATH) {
      var service = {
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
      function findAdmins() {
        var request = $http({
          method: 'GET',
          url: ADMIN_TOOL_URL + '/admin/admins',
          headers: {
            "Content-Type": "application/json",
          }
        });
        return _processRequest(request, 'allAdmins');
      }

      /**
       * creates admin user
       */
      function createAdmin(data) {
        var request = $http({
          method: 'POST',
          url: ADMIN_TOOL_URL + '/admin/admins',
          headers: {
            "Content-Type": "application/json",
          },
          data: angular.toJson(data)
        });
        return _processRequest(request);
      }

      /**
       * Delete an existing admin user
       */
      function deleteAdmin(data) {
        var request = $http({
          method: "DELETE",
          url: ADMIN_TOOL_URL + "/admin/admins",
          headers: {
            "Content-Type": "application/json",
          },
          data: angular.toJson(data)
        });
        return _processRequest(request);
      }


      /**
       * Find copilots
       */
      function findCopilots() {
        var request = $http({
          method: 'GET',
          url: ADMIN_TOOL_URL + '/admin/copilots',
          headers: {
            "Content-Type": "application/json",
          }
        });
        return _processRequest(request, 'allCopilots');
      }

      /**
       * creates copilot
       */
      function createCopilot(data) {
        var request = $http({
          method: 'POST',
          url: ADMIN_TOOL_URL + '/admin/copilots',
          headers: {
            "Content-Type": "application/json",
          },
          data: angular.toJson(data)
        });
        return _processRequest(request);
      }

      /**
       * Delete copilot
       */
      function deleteCopilot(data) {
        var request = $http({
          method: "DELETE",
          url: ADMIN_TOOL_URL + "/admin/copilots",
          headers: {
            "Content-Type": "application/json",
          },
          data: angular.toJson(data)
        });
        return _processRequest(request);
      }

      /**
       * Update copilot
       */
      function updateCopilot(data) {
        return deleteCopilot(data).then(function () {
          return createCopilot(data);
        });
      }


      /**
       * Find Reviewers
       */
      function findReviewers(categoryId) {
        var request = $http({
          method: 'GET',
          url: ADMIN_TOOL_URL + '/admin/reviewers',
          params: {
            categoryId: categoryId
          },
          headers: {
            "Content-Type": "application/json",
          }
        });
        return _processRequest(request, 'reviewers');
      }


      /**
       * creates Reviewer
       */
      function createReviewer(data) {
        var request = $http({
          method: 'POST',
          url: ADMIN_TOOL_URL + '/admin/reviewers',
          headers: {
            "Content-Type": "application/json",
          },
          data: angular.toJson(data)
        });
        return _processRequest(request);
      }

      /**
       * Delete Reviewer
       */
      function deleteReviewer(data) {
        var request = $http({
          method: "DELETE",
          url: ADMIN_TOOL_URL + "/admin/reviewers",
          headers: {
            "Content-Type": "application/json",
          },
          data: angular.toJson(data)
        });
        return _processRequest(request);
      }


      /**
       * Update Reviewer
       */
      function updateReviewer(oldReviewer, newReviewer) {
        var requests = [deleteReviewer(oldReviewer)];
        if (oldReviewer.categoryId !== newReviewer.categoryId) {
          requests.push(deleteReviewer({
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
          return createReviewer(newReviewer)
        });
      }

      /**
       * Find review board project categories
       */
      function findReviewBoardProjectCategories() {
        var request = $q.all([$http({
          method: 'GET',
          url: ADMIN_TOOL_URL + '/develop/challengetypes',
          headers: {
            "Content-Type": "application/json",
          }
        }), $http({
          method: 'GET',
          url: ADMIN_TOOL_URL + '/design/challengetypes',
          headers: {
            "Content-Type": "application/json",
          }
        })]);
        return _processRequest(request);
      }

      return service;
    }]);
