angular.module('supportAdminApp')
.factory('RoleService', [
  '$http', 'API_URL', '$log', '$q',
  function($http, API_URL, $log, $q) {
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
      }).catch(Service.handleError);
    };

    /**
     * Creates a new role.
     * @param {String} roleName
     * @return {Promise} Resolves to the created role object.
     */
    Service.createRole = function(roleName) {
      return $http({
        method: 'POST',
        url: API_URL + '/v3/roles',
        data: angular.toJson({
          param: {
            roleName: roleName
          }
        }),
        headers: {
          'Content-Type': 'application/json'
        }
      }).then(function(res) {
        return res.data.result.content;
      }).catch(Service.handleError);
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
      }).catch(Service.handleError);
    };

    /**
     * Gets roles of the specified subject
     *
     * @return {Promise} Resolves to the array of role objects, sorted
     *  by names.
     */
    Service.getRolesBySubject = function(subjectId) {
      return $http.get(API_URL + '/v3/roles/?filter=subjectID=' + subjectId)
      .then(function(res) {
        return res.data.result.content.sort(function(a, b) {
          return a.roleName.localeCompare(b.roleName);
        });
      }).catch(Service.handleError);
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
      }).catch(Service.handleError);
    };

    /**
     * Gets role by id.
     *
     * @return {Promise} Resolves to the object of one role.
     */
    Service.getRole = function(roleId, fields) {
      // there is a bug in backend, when we ask to get role subjects
      // but there are no subjects, backend returns 404 even if role exists
      // as a workaround we get role without subjects first to check if it exists
      // and only after we try to get it subject
      // TODO: remove code in this if, after this bug is fixed at the backend
      //       keep only the part after else
      if (fields && _.includes(fields, 'subjects')) {
        var fieldsWithouSubjects = _.without(fields, 'subjects');
        // if there are no fields after removing 'subjects', add 'id' to retrieve minimum data
        if (!fieldsWithouSubjects.length) {
          fieldsWithouSubjects.push('id');
        }

        return $http.get(API_URL + '/v3/roles/' + roleId + (fields ? '?fields=' + fieldsWithouSubjects.join(',') : '')).then(function(res) {
          var roleWithoutSubjects = res.data.result.content;

          // now let's try to get subjects
          return $http.get(API_URL + '/v3/roles/' + roleId + '?fields=subjects').then(function(res) {
              // populate role with subjects and return it
              return _.assign(roleWithoutSubjects, {
                subjects: res.data.result.content.subjects
              });
            }).catch(function(error) {
              // if get error 404 in this case we know role exits
              // so just return roleWithoutSubjects with subjects as en empty array
              if (error.data && error.data.result && error.data.result.status === 404) {
                return _.assign(roleWithoutSubjects, {
                  subjects: []
                });

              // for other errors return rejected promise with error
              } else {
                return $q.reject(error);
              }
            });
        }).catch(Service.handleError);

      // if don't ask for subjects, then just normal request
      } else {
        return $http.get(API_URL + '/v3/roles/' + roleId + (fields ? '?fields=' + fields.join(',') : ''))
          .then(function(res) {
            return res.data.result.content;
          }).catch(Service.handleError);
      }
    };



    /**
     * Handle API response error
     *
     * @param  {Error}   error    the error as received in catch callback
     * @return {Promise}          rejected promise with error
     */
    Service.handleError = function(error) {
      var err;

      $log.error(error);

      if (error && error.data) {
        err = {
          status: error.status,
          error : error.data.result.content
        };
      }

      if (!err) {
        err = {
          status: error.status,
          error : error.message
        };
      }

      return $q.reject(err);
    }

    return Service;
  }
]);
