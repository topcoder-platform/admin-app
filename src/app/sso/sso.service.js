'use strict';

angular.module('supportAdminApp')
  .factory('SSOService', ['$log', '$q','$http', 'API_URL',
    function ($log, $q, $http, API_URL) {
    // local dev
    // var API_URL = 'http://local.topcoder-dev.com:8080';
      return ({
        /* add sso user */
        addSSOUser: function(jsonInput, showFullResponse) {

                  $log.debug("in addSSOUser");
                  $log.debug(jsonInput);
                    var payload = "{\"param\": {" +
                                            "\"handle\": \""+jsonInput.handle+"\","+
                                            "\"firstName\": \""+jsonInput.firstName+"\","+
                                            "\"lastName\": \""+jsonInput.lastName+"\","+
                                            "\"email\": \""+jsonInput.email+"\","+
                                            "\"active\": true,"+
                                            "\"country\": {"+
                                            "\"name\": \""+jsonInput.country+"\"},"+
                                            "\"profile\": {"+
                                            "\"providerType\": \""+jsonInput.providerType+"\","+
                                            "\"provider\": \""+jsonInput.provider+"\","+
                                            "\"userId\": \""+jsonInput.userId+"\"}}}";
                    $log.debug("payload is "+payload);
                    var request = $http({
                        method: 'POST',
                        url: API_URL + '/v3/users',
                        headers: {
                            "Content-Type":"application/json"
                        },
                        data: payload
                    });
                    var errors;
                    var response;
                    return request.then(
                        function(response) {
                            $log.debug(response);
                            if (!showFullResponse) {
                                response = "HANDLE: "+jsonInput.handle+" STATUS: "+response.status;
                            }
                            return response;
                        },
                        function(error) {
                            $log.error(error);
                            var err;
                            if(error && error.data && error.data.result) {
                                err = {
                                    status: error.status,
                                    error : error.data.result.content
                                };
                                $log.error("Status: "+error.status);
                                $log.error("Error Reason:  "+error.data.result.content);
                                if (!showFullResponse) {
                                    errors = "HANDLE: "+jsonInput.handle+" STATUS: "+error.status+" REASON: "+error.data.result.content;
                                }else {
                                    errors = error;
                                }
                            }
                            if(!err) {
                                err = {
                                    status: error.status,
                                    error : error.statusText
                                };
                            }
                            return $q.reject(errors);
                        }
                    );

                }, // addSSOUser()
      });
    }]);