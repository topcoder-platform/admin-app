'use strict';

angular.module('supportAdminApp')
.factory('IdeaService', ['$log', '$q', '$http', 'SPIGIT_API_URL', 'SPIGIT_API_VERSION_PATH','helper','OAuth2Service',
function($log, $q, $http, SPIGIT_API_URL, SPIGIT_API_VERSION_PATH, helper, OAuth2Service) {

  var IdeaService = {};

  /**
   * Get idea list by communityId and stageId
   * @param domain
   * @param communityId the community id
   * @param stageId the stage id
   * @returns {*}
   */
  IdeaService.getIdeaList = function(domain, communityId, stageId) {

    const token = OAuth2Service.getOAuthToken();
    var request = $http({
        method: 'GET',
        url: 'https://' + domain + "." + SPIGIT_API_URL + SPIGIT_API_VERSION_PATH + '/communities/' + communityId + '/ideas?idea_stage=' + stageId,
        headers: {
          'Authorization': token,
        }
      });

    return request.then(function (response) {
      return response.data;
    }, function(error) {
      var err;
      if (error && error.data) {
        err = {
          status: error.status,
          error: error.data.dev_message
        }
      }

      if (!err) {
        err = {
          status: error.status,
          error: error.statusText
        }
      }
      return $q.reject(err);
    });
  };


  /**
   * Get idea detail
   * @param domain
   * @param ideaId the idea id
   * @returns {*}
   */
  IdeaService.getIdeaDetail = function (domain, ideaId) {

    const token = OAuth2Service.getOAuthToken();
    var request = $http({
      method: 'GET',
      url: 'https://' + domain + "." + SPIGIT_API_URL + SPIGIT_API_VERSION_PATH + '/ideas/' + ideaId,
      headers: {
        'Authorization': token,
      }
    });

    return request.then(function (response) {
      return response.data;
    }, function(error) {
      var err;
      if (error && error.data) {
        err = {
          status: error.status,
          error: error.data.dev_message
        }
      }

      if (!err) {
        err = {
          status: error.status,
          error: error.statusText
        }
      }
      return $q.reject(err);
    });
  }

  /**
   * Get user detail
   * @param domain
   * @param userId the user id
   * @returns {*}
   */
  IdeaService.getUserDetail = function (domain, userId) {

    const token = OAuth2Service.getOAuthToken();
    var request = $http({
      method: 'GET',
      url: 'https://' + domain + "." + SPIGIT_API_URL + SPIGIT_API_VERSION_PATH + '/users/' + userId,
      headers: {
        'Authorization': token,
      }
    });

    return request.then(function (response) {
      return response.data;
    }, function(error) {
      var err;
      if (error && error.data) {
        err = {
          status: error.status,
          error: error.data.dev_message
        }
      }

      if (!err) {
        err = {
          status: error.status,
          error: error.statusText
        }
      }
      return $q.reject(err);
    });
  }

  return IdeaService;
}]);