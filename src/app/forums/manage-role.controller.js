module.controller('forums.RolesManageDialogController', [
    '$scope', '$uibModalInstance', 'ChallangeForumService', 'Alert', 'user', '$q',
    function ($scope, $modalInstance, challangeForumService, $alert, user, $q) {

        // currently selected user object
        $scope.user = user;

        // currently selected user role list
        $scope.userRoles = [];

        // true if role list is being loaded
        $scope.isLoading = false;

        // true if are removing a role
        $scope.isRemoving = false;

        // true if we are adding a role
        $scope.isAdding = false;

        // role id selected to add
        $scope.roleToAdd = '';

        // list of existent roles where user is not a member
        $scope.availableRoles = [];

        // array of all the existent roles
        var allRoles = [];

        /**
         * Update list of available roles which
         * @return {[type]} [description]
         */
        function updateAvailableRoles() {
            var userRoleIds = $scope.userRoles.map(function (role) {
                return role.roleID;
            });

            $scope.availableRoles = allRoles.filter(function (role) {
                return userRoleIds.indexOf(role.roleID) === -1;
            });
        }

        /**
         * Close dialog
         */
        $scope.close = function () {
            $modalInstance.close();
        };

        /**
         * Load user roles and full list of existent roles
         */
        $scope.loadData = function () {
            $alert.clear();
            $scope.isLoading = true;
            $q.all([
                challangeForumService.getUser(user.userID),
                challangeForumService.getRoles()
            ]).then(function (data) {
                $scope.userRoles = data[0].roles;
                allRoles = data[1];
                updateAvailableRoles();
            }).catch(function (error) {
                $alert.error(error.message, $scope);
            }).finally(function () {
                $scope.isLoading = false;
            });
        }

        /**
         * Submit add role form
         */
        $scope.addRole = function () {
            $alert.clear();
            $scope.isAdding = true;
            var roleIds = $scope.userRoles
                .map(function (val) {
                    return val.roleID;
                });

            console.log($scope.roleToAdd);
            roleIds.push($scope.roleToAdd);
            challangeForumService.updateUserRoles($scope.user.userID, roleIds).then(function () {
                $alert.success('Role added successfully.', $scope);
                var role = $scope.availableRoles.find(function (val) {
                    return val.roleID === parseInt($scope.roleToAdd);
                });
                $scope.userRoles.push(role);
                // as roles sorted by default we keep them sorted
                $scope.userRoles = _.sortBy($scope.userRoles, 'roleID');
                $scope.roleToAdd = '';
                updateAvailableRoles();
            }).catch(function (error) {
                $alert.error(error.message, $scope);
            }).finally(function () {
                $scope.isAdding = false;
            });
        }

        /**
         * Helper function which removes role from role list
         *
         * @param  {Object} role role object to remove
         */
        function removeRoleFromList(role) {
            _.remove($scope.userRoles, { roleID: role.roleID });
            updateAvailableRoles();
        }

        /**
         * Remove user from specified role
         * @param  {Object} role role from where we have to remove user
         */
        $scope.removeRole = function (role) {
            $alert.clear();
            $scope.isRemoving = true;
            role.isRemoving = true;
            var roleIds = $scope.userRoles
                .filter(function (val) {
                    return val.roleID !== role.roleID;
                })
                .map(function (val) {
                    return val.roleID;
                });

            return challangeForumService.updateUserRoles($scope.user.userID, roleIds).then(function () {
                $alert.success('Role removed successfully.', $scope);
                removeRoleFromList(role);
            }).catch(function (error) {
                $alert.error('Cannot remove from the role `' + role.roleName + '`. Server error: "' + error.message + '"', $scope);
            }).finally(function () {
                // always clean the flag as we can add this role back
                role.isRemoving = false;
                // check if anything is still removing
                $scope.isRemoving = !!_.find($scope.userRoles, { isRemoving: true });
            });
        }

        /**
         * Trigger initial data load.
         */
        $scope.loadData();

    }
]);
