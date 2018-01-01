'use strict';

angular.module('supportAdminApp')
  .factory('MemberService', ['$log', '$q', '$http', 'API_URL',
    function ($log, $q, $http, API_URL) {
      return ({
        /* add member */
        addMember: function (user, activate, showFullResponse) {
          var payload = { param: user };

          var request = $http({
            method: 'POST',
            url: API_URL + '/v3/users',
            headers: {
              "Content-Type": "application/json"
            },
            data: JSON.stringify(payload)
          });
          return request.then(
            function (response) {
              if (response.data.result.status === 200) {
                return { status: "Success", message: "", content: response.data.result.content }
              } else {
                return { status: "Fail", message: response.data.result.content }
              }
            },
            function (error) {
              return $q.reject({ status: "Fail", message: error.data.result ?  error.data.result.content : error.data.message });
            }
          );

        }, // addMember()
      });
    }]);