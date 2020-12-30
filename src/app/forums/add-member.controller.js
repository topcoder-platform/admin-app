module.controller('forums.AddMemberDialogController', [
    '$scope', '$uibModalInstance', 'ChallangeForumService', 'Alert', 'group', 'user',
    function ($scope, $modalInstance, $challangeForumService, $alert, group, user) {

        /**
         * The group object.
         */
        $scope.group = group;

        /**
         * User object.
         */
        $scope.user = user;

        /**
         * A flag to determine the operation edit or add.
         */
        $scope.edit = user !== undefined && user !== null;

        /**
         * A flag to show loader.
         */
        $scope.isLoading = false;

        /**
         * The form data.
         */
        $scope.form = {
            handle: '',
            userId: 0,
            watch: true,
            follow: true
        };

        /**
         * Load initial user data.
         */
        $scope.loadData = function () {
            $alert.clear();
            $scope.isLoading = true;

            $challangeForumService.getGroupMemberDetails(group.groupID, user.userID)
                .then(function (data) {
                    $scope.user = data;
                    $scope.form = {
                        handle: user.name,
                        userId: user.userID,
                        watch: data.watch,
                        follow: data.follow
                    };
                }).catch(function (error) {
                    $alert.error(error.message, $scope);
                }).finally(function () {
                    $scope.isLoading = false;
                });
        }

        /**
         * Close the modal
         */
        $scope.cancel = function () {
            $modalInstance.close();
        };

        /**
         * Save the user data.
         */
        $scope.submit = function () {
            $alert.clear();
            $scope.isLoading = true;
            $challangeForumService.getUserByHandle($scope.form.handle).then(function (user) {
                $challangeForumService.addUserToGroup({
                    "userID": user.userID,
                    "watch": $scope.form.watch,
                    "follow": $scope.form.follow
                }, $scope.group.groupID)
                    .then(function () {
                        $alert.success("The operation is succeeded.", $scope);
                    })
                    .catch(function (error) {
                        if (error.status == 404) {
                            $alert.error('No user found with handle ' + $scope.form.handle + '. Please try another.',
                                $scope);
                        } else {
                            $alert.error(error.message, $scope);
                        }
                    }).finally(function () {
                        $modalInstance.close();
                    });
            }).catch(function (error) {
                if (error.status == 404) {
                    $alert.error('No user found with handle ' + $scope.form.handle + '. Please try another.',
                        $scope);
                } else {
                    $alert.error(error.message, $scope);
                }
            }).finally(function () {
                $scope.isLoading = false;
            });
        };

        /**
         * Based on the flag load initial data.
         */
        if ($scope.edit) {
            $scope.loadData();
        }

    }
]);