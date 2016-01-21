'use strict';

angular.module('supportAdminApp')
  .factory('SSOService', ['$q','$http', 'API_URL',
    function ($q, $http, API_URL) {
    // local dev
    // var API_URL = 'http://local.topcoder-dev.com:8080';
      return ({
        /* add sso user */
        addSSOUser: function(jsonInput) {

                  console.log("in addSSOUser ");
                  var request = $http({
                    method: 'POST',
                    url: API_URL + '/v3/users',
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
                }, // addSSOUser()
      });
    }]);