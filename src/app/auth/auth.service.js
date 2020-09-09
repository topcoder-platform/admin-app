'use strict';

angular.module('supportAdminApp')
  .factory('AuthService', [
             '$q', '$log', 'jwtHelper', '$cookies', '$window', '$state', 'AUTH_URL', 'ACCOUNTS_CONNECTOR_URL', 'COOKIES_SECURE', 'JWT_V3_NAME', 'JWT_V2_NAME',
    function($q, $log, jwtHelper, $cookies, $window, $state, AUTH_URL, ACCOUNTS_CONNECTOR_URL, COOKIES_SECURE, JWT_V3_NAME, JWT_V2_NAME) {
      // these constants are for AuthService internal usage only
      // they don't depend on the environment thus don't have to be placed in global config
      var GET_FRESH_TOKEN_REQUEST = 'GET_FRESH_TOKEN_REQUEST';
      var GET_FRESH_TOKEN_SUCCESS = 'GET_FRESH_TOKEN_SUCCESS';
      var GET_FRESH_TOKEN_FAILURE = 'GET_FRESH_TOKEN_FAILURE';

      var LOGOUT_REQUEST = 'LOGOUT_REQUEST';
      var LOGOUT_SUCCESS = 'LOGOUT_SUCCESS';
      var LOGOUT_FAILURE = 'LOGOUT_FAILURE';

      // local variables
      var connectorIFrame, url, loading;

      /**
       * Create invisible iframe and append it to the body
       *
       * @param  {String} id    iframe tag id
       * @param  {String} src   iframe source
       * @return {HTMLElement}  dom element of the iframe
       */
      function createFrame(id, src) {

        var iframe = document.createElement('iframe');

        iframe.id = id;
        iframe.src = src;
        iframe.width = 0;
        iframe.height = 0;
        iframe.frameborder = 0;

        // set inline style cross-browser way to make iframe completely invisible
        angular.element(iframe).css({
          display: 'block',
          border: '0'
        })

        document.body.appendChild(iframe);

        return iframe;
      }

      /**
       * Proxies calls to the iframe from main window
       *
       * @param  {String} REQUEST request id
       * @param  {String} SUCCESS success respond id
       * @param  {String} FAILURE failure respond id
       * @param  {Object} params  params of the request
       * @return {Promise}        promise of the request
       */
      function proxyCall(REQUEST, SUCCESS, FAILURE, params) {
        if (!connectorIFrame) {
          throw new Error('connector has not yet been configured.')
        }

        var params = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : {};

        function request() {
          return $q(function(resolve, reject) {
            function receiveMessage(e) {
              var safeFormat = e.data.type === SUCCESS || e.data.type === FAILURE
              if (safeFormat) {
                window.removeEventListener('message', receiveMessage)
                if (e.data.type === SUCCESS) resolve(e.data)
                if (e.data.type === FAILURE) reject(e.error)
              }
            }

            window.addEventListener('message', receiveMessage)

            var payload = $.extend({}, { type: REQUEST }, params)

            connectorIFrame.contentWindow.postMessage(payload, url)
          })
        }

        return loading.then(request)
      }

      /**
       * Create invisible iframe which will be used to retrieve token v3
       *
       * @param  {Object} options frameId and connectorUrl for the iframe
       * @return {Promise}        promise on iframe load
       */
       function configureConnector(options) {
        if (connectorIFrame) {
          $log.warn('iframe connector can only be configured once, this request has been ignored.')
        } else {
          connectorIFrame = createFrame(options.frameId, options.connectorUrl)
          url = options.connectorUrl

          loading = $q(function(resolve) {
            connectorIFrame.onload = function() {
              resolve()
            }
          })
        }
      }

      var AuthService = {
        ERROR: {
          NO_PERMISSIONS: 'Current user doesn\'t have administrator permissions.'
        }
      };

      /**
       * Returns promise which is resolved when connector iframe is loaded
       *
       * @return {Promise}
       */
      AuthService.ready = function() {
        if (!connectorIFrame) {
          throw new Error('AuthService.init() has to be called once when app run before any other methods of AuthService.');
        }

        return loading;
      }

      /**
       * Retrieves new token v3 using hidden iframe
       * check that user has administrator credentials and save it to the cookies
       *
       * @return {Promise} promise to get token v3
       */
      AuthService.retriveFreshToken = function() {
        return proxyCall(GET_FRESH_TOKEN_REQUEST, GET_FRESH_TOKEN_SUCCESS, GET_FRESH_TOKEN_FAILURE)
          .then(function(data) {
              var user = jwtHelper.decodeToken(data.token);

              if ($.inArray('administrator', user && user.roles) < 0) {
                return $q.reject(AuthService.ERROR.NO_PERMISSIONS);
              } else {
                AuthService.setTokenV3(data.token);
              }
            });
      }

      /**
       * Log out user
       * Clear cookies and send request to the server for log out
       *
       * @return {Promise} promise which is resolved when user is logged out on the server
       */
      AuthService.logout = function() {
        // send request to the server that we want to log out
        // save logginOut promise to be accessed any time
        AuthService.logginOut = proxyCall(LOGOUT_REQUEST, LOGOUT_SUCCESS, LOGOUT_FAILURE).then(function() {
          AuthService.logginOut = null;
        });
        // remove only token V3, which we set from the script manually
        // token V2 will be removed automatically during logout server request
        $cookies.remove(JWT_V3_NAME);

        return AuthService.logginOut;
      }

      AuthService.login = function() {
        $window.location.href = AUTH_URL + '?retUrl=' + encodeURIComponent($window.location.href);
      }

      /**
       * Init auth service
       * This has to called once when app starts
       */
      AuthService.init = function() {
        // add hidden iframe which is used to get API v3 token
        configureConnector({
          connectorUrl: ACCOUNTS_CONNECTOR_URL,
          frameId: 'tc-accounts-iframe',
        });
      }

      /**
       * Checks if user is already login or not
       * If usr is not login, then redirect to TopCoder login form
       *
       * @return {Promise} promise to authenticate
       */
      AuthService.authenticate = function() {
        return AuthService.ready().then(function() {
          if (AuthService.isLoggedIn()) {
            return $q.resolve();
          } else {
            if (AuthService.getTokenV2()) {
              return AuthService.retriveFreshToken().catch(function(err) {
                // if error about permission denied we will pass this error through
                // otherwise got to login page
                if (err !== AuthService.ERROR.NO_PERMISSIONS) {
                  AuthService.login();
                }
                return $q.reject(err);
              });
            } else {
              AuthService.login();
              return $q.reject();
            }
          }
        });
      }

      /**
       * Returns token v3 or null
       *
       * @return {String} token v3
       */
      AuthService.getTokenV3 = function() {
        return $cookies.get(JWT_V3_NAME);
      }

      /**
       * Save token V3 to cookies
       */
      AuthService.setTokenV3 = function(token) {
        return $cookies.put(JWT_V3_NAME, token, {
          secure: COOKIES_SECURE,
        });
      }

      /**
       * Check if token V3 is expired or no
       *
       * @return {Boolean} true if token V3 is expired
       */
      AuthService.isTokenV3Expired = function() {
        return !AuthService.getTokenV3() || jwtHelper.isTokenExpired(AuthService.getTokenV3(), 10);
      }

      /**
       * Returns token v2 or null
       *
       * @return {String} token v2
       */
      AuthService.getTokenV2 = function() {
        return $cookies.get(JWT_V2_NAME);
      }

      /**
       * Check if user is fully logged in
       *
       * @return {Boolean}  true if user is logged in
       */
      AuthService.isLoggedIn = function() {
        // we have to ckeck only for token v3, as if have this one, it means we have and v2 also
        return !!AuthService.getTokenV3();
      }

      /**
       * Returns information of the current user, which is retrieved from token v3
       *
       * @return {Object} current user object
       */
      AuthService.getCurrentUser = function() {
        var tctV3 = AuthService.getTokenV3();

        if (!tctV3) {
          return null;
        }

        var currentUser = jwtHelper.decodeToken(tctV3);
        currentUser.id = currentUser.userId;
        currentUser.token = tctV3;

        return currentUser;
      }

      return AuthService;

    }]);
