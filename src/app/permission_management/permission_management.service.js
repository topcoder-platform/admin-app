angular.module('supportAdminApp')
.factory('PermissionManagementService', [
  '$http', 'API_URL',
  function($http, API_URL) {
    var Service = {};

    /**
     * Assigns role to the user.
     * @param {String} roleId
     * @param {String} userId
     * @return {Promise} Resolves to the roleId, if success.
     */
    Service.assignRole = function(roleId, userId) {
      return $http.post(API_URL + '/v3/roles/' + roleId
      + '/assign?action=true&filter=subjectID%3D' + userId)
      .then(function(res) {
        return res.data.result.content;
      });
    };

    /**
     * Creates a new role.
     * @param {String} roleName
     * @return {Promise} Resolves to the created role object.
     */
    Service.createRole = function(roleName) {
      return $http.post(API_URL + '/v3/roles', {
        param: {
          roleName: roleName
        }
      }).then(function(res) {
        return res.data.result.content;
      });
    };

    /**
     * Gets roles.
     * @return {Promise} Resolves to the array of role objects, sorted
     *  by names.
     */
    Service.getRoles = function() {
      return $http.get(API_URL + '/v3/roles')
      .then(function(res) {
        return res.data.result.content.sort(function(a, b) {
          return a.roleName.localeCompare(b.roleName);
        });
      });
    };

    /**
     * Unassigns the role from the user.
     * @param {String} roleId
     * @param {String} userId
     * @return {Promise} Resolves to the roleId, if success.
     */
    Service.unassignRole = function(roleId, userId) {
      return $http.delete(API_URL + '/v3/roles/' + roleId
      + '/deassign?action=true&filter=subjectID%3D' + userId)
      .then(function(res) {
        return res.data.result.content;
      });
    };

    return Service;
  }
]);
