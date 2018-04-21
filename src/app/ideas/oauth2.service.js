'use strict';

angular.module('supportAdminApp')
.factory('OAuth2Service', ['$q', '$log', '$http', 'helper', '$cookies', '$state', 'OAUTH2_TOKEN_NAME', 'COOKIES_SECURE', 'OAUTH2_CLIENT_SECRET', 'SPIGIT_API_URL', 'OAUTH2_TOKEN_EXPIRETIME_TAGNAME', 'moment',
  function($q, $log, $http, helper,$cookies, $state, OAUTH2_TOKEN_NAME, COOKIES_SECURE,  OAUTH2_CLIENT_SECRET, SPIGIT_API_URL, OAUTH2_TOKEN_EXPIRETIME_TAGNAME, moment) {

  var OAuth2Service = { };

    /**
     * Get new OAuth2 Token
     * @param username
     * @param password
     * @param domain
     * @param clientId
     * @returns {Promise<any>}
     */
    OAuth2Service.refreshToken = function(username, password, domain, clientId) {

        var params = {
          grant_type: 'password',
          username: username,
          password: password,
          client_id : clientId,
          client_secret: OAUTH2_CLIENT_SECRET
        };
        const searchParams = Object.keys(params).map(function (key) {
          return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
        }).join('&');

      var request = $http({
        method: 'POST',
        url: 'https://' + domain + "." + SPIGIT_API_URL  + '/oauth/token',
        headers: {
          'Authorization': '',
          "Content-Type": "application/x-www-form-urlencoded"
        },
        data: searchParams
      });

      return request.then(function (response) {
        OAuth2Service.setOAuthToken(response.data.token_type + ' ' + response.data.access_token , response.data.expires_in);
        return (response.data);
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
            error: 'Invalid domain'
          }
        }
        return $q.reject(err);
      });

    };

  /**
   * Return oauth2 token or null
   * @returns {*|string} oauth2 token
   */
  OAuth2Service.getOAuthToken = function() {
    return $cookies.get(OAUTH2_TOKEN_NAME);
  }

    /**
     * Save oauth2 token to cookies
     * @param token oauth2 token
     * @param duration  token valid duration
     * @returns {*|void}
     */
  OAuth2Service.setOAuthToken= function(token, duration) {
    var expire_at = moment().add(duration, 's');
    $cookies.put(OAUTH2_TOKEN_EXPIRETIME_TAGNAME, expire_at.format().toString());
    return $cookies.put(OAUTH2_TOKEN_NAME, token, {
      secure: COOKIES_SECURE,
    });
  }

    /**
     * Check OAuth2 Token Expire Time
     * @returns {boolean}
     */
  OAuth2Service.checkTokenExpireTime = function() {
    if (moment().isBefore($cookies.get(OAUTH2_TOKEN_EXPIRETIME_TAGNAME))) {
      return false;
    } else {
      return true;
    }
  }

  return OAuth2Service;

}]);