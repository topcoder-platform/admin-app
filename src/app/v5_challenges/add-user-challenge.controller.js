module.controller('v5challenge.AddUserController', [
    '$scope',
    '$timeout',
    '$uibModalInstance',
    'UserService',
    'ChallengeService',
    'Alert',
    'parentScope',
    'challenge',
    function ($scope, $timeout, $modalInstance, UserService, $challengeService, $alert, $parentScope, challenge) {
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
         * searches the handle.
         * @param {string} filter the filter.
         */
        $scope.searchHandle = function (filter) {
            $scope.isLoading = true;
            return UserService.getMemberSuggestByHandle(filter).then(function (data) {
                $scope.isLoading = false;
                return _.map(data, function (x) { return x.handle });
            })
        };

        /**
         * handles save click.
         */
        $scope.save = function () {
            $scope.clearError()
            $scope.isLoading = true;

            $challengeService.v5.addChallengeResource({
                challengeId: $scope.challenge.id,
                memberHandle: $scope.handle,
                roleId: $scope.roleId
            }).then(function () {
                $alert.success('User has been added.', $scope);
                $parentScope.search();
            }).catch(function (error) {
                $alert.error(error.error, $scope);
            }).finally(function () {
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
