module.controller('v5challenge.AddUserController', [
    '$scope',
    '$q',
    '$uibModalInstance',
    'UserService',
    'ChallengeService',
    'Alert',
    'parentScope',
    'challenge',
    function ($scope, $q, $modalInstance, UserService, $challengeService, $alert, $parentScope, challenge) {
        $scope.challenge = challenge
        $scope.handle = '';
        $scope.isLoading = false;
        $scope.handles = [];
        $scope.roles = [];
        $scope.roleId = null;

        $challengeService.v5.getResourceRoles().then(function (data) {
            $scope.roles = data;
        }).catch(function (roleError) {
            $alert.error(roleError.error, $rootScope);
        });

        /**
         * Close dialog.
         */
        $scope.close = function () {
            $modalInstance.close();
        };



        /**
         * handles save click.
         */
        $scope.save = function () {
            $scope.clearError()
            $scope.isLoading = true;
            var success = [];
            var errors = [];

            var promiseArray = $scope.handles.map(function(handle) {
                return $challengeService.v5.addChallengeResource({
                    challengeId: $scope.challenge.id,
                    memberHandle: handle,
                    roleId: $scope.roleId
                }).then(function () {
                    success.push({handle: handle});
                }).catch(function (error) {
                    errors.push({handle: handle, message: error.error});
                })
            })

            $q.all(promiseArray)
            .finally(function () {
                if (success.length) {
                    $parentScope.search();
                    if (success.length > 1)
                        $alert.success(success.length + ' users have been added.', $scope);
                    else
                        $alert.success('User has been added.', $scope);
                }
                if (errors.length) {
                    var messages = [];
                    messages = errors.map(function(error) {
                        return error.handle + ": " + error.message;
                    })
                    $alert.error(messages, $scope);
                }
                $scope.isLoading = false;
            });
        };

        /**
         * clears the alerts.
         */
        $scope.clearError = function () {
            $alert.clear();
        };
    }
]);
