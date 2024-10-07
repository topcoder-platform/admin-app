'use strict';

/**
 * Inject JWT token into http requests
 *
 * It inject token V2 for requests to API V2
 * and token V3 for requests to API V3
 */

angular.module('supportAdminApp')
  .config(function($httpProvider, jwtInterceptorProvider) {
    var refreshingToken = null;

    jwtInterceptorProvider.tokenGetter = [
              'AuthService', '$http', 'API_URL', 'ADMIN_TOOL_URL', 'config',  'SPIGIT_API_URL',
      function($authService, $http, API_URL, ADMIN_TOOL_URL, config, SPIGIT_API_URL) {
        if (config.url.indexOf(SPIGIT_API_URL) === -1) {

            var currentToken = $authService.getTokenV3();

            function handleRefreshResponse(res) {
              var newToken, ref, ref1, ref2;

              newToken = (ref = res.data) != null ? (ref1 = ref.result) != null ? (ref2 = ref1.content) != null ? ref2.token : void 0 : void 0 : void 0;

              $authService.setTokenV3(newToken);
              $authService.removeV2Token();

              return newToken;
            };

            function refreshingTokenComplete() {
              return refreshingToken = null;
            };

            if ($authService.getTokenV3() && $authService.isTokenV3Expired()) {
              if (refreshingToken === null) {
                refreshingToken = $http({
                  method: 'GET',
                  url: API_URL + "/v3/authorizations/1",
                  headers: {
                    'Authorization': "Bearer " + currentToken
                  }
                })
                  .then(handleRefreshResponse)["finally"](refreshingTokenComplete)
                  .catch(function () {
                    $authService.login();
                    $authService.removeV2Token();

                  });
              }
              return refreshingToken;
            } else {
              $authService.removeV2Token();
              return currentToken;
            }
          }
        }];

    return $httpProvider.interceptors.push('jwtInterceptor');
  });
