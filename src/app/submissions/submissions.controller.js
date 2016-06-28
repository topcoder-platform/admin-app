'use strict';

var module = angular.module('supportAdminApp');

module.controller('submissions.SearchController', ['$scope', '$rootScope', '$timeout', '$state', '$uibModal',
    'AuthService', 'SubmissionService', 'UserService', 
    function ($scope, $rootScope, $timeout, $state, $modal, $authService, $submissionService, $userService) {

        /**
         * Check if user is logged in
         */
        $scope.authorized = function () {
            return $authService.isLoggedIn();
        };

        /** 
         * Object storing state of challenge search and 
         * adding new submission operation
         */
        $scope.challengeSearch = {
            isLoading: false,
            challengeFound: false,
            addSubmission: false,
            submissionSubmitted: false,
            challengeId: '',
            setLoading: function (loading) {
                this.isLoading = loading;
            }
        };

        /** Challenge object of currently fetched challenge */
        $scope.challengeObj = null;
        $scope.isValidChallenge = false;


        
        /**
         * This method finds challenge by ChallengeId and 
         * list of Submissions for challenge 
         */
        $scope.findChallenge = function () {
            $scope.$broadcast('alert.ClearAll', {});
            $scope.challengeSearch.isLoading = true;
            $scope.submission = {};
            /** Fetches Challenge Details  */
            $submissionService.findChallengeById($scope.challengeSearch.challengeId).then(
                function (responseChallenge) {
                     //Set of Challenge Phases
                    $submissionService.getChallengePhases($scope.challengeSearch.challengeId).then(
                        function(phases) {
                            $scope.challengePhases = phases;
                        },
                        function(error) {
                            $scope.$broadcast('alert.AlertIssued', {
                                type: 'danger',
                                message: error
                            });
                        }
                    );
                    $scope.challengeSearch.challengeFound = true;
                    $scope.challengeObj = responseChallenge;
                    $scope.challengeSearch.isLoading = false;
                    $scope.challengeSearch.setLoading(false);
                },
                function (error) {
                    $scope.challengeSearch.isLoading = false;
                    $scope.challengeSearch.challengeFound = false;
                    var errorMessage = error.error;
                    if (error.status == 404) {
                        errorMessage = 'Challenge with id ' + $scope.challengeSearch.challengeId +
                        ' not found';
                    }
                    $scope.$broadcast('alert.AlertIssued', {
                        type: 'danger',
                        message: errorMessage
                    });
                }
                );
        };

        /**
         * This method uploads list of submission files to S3
         */
        var uploadFile = function (presignedUrlsObj) {
            var presignedFileUrlObjs = presignedUrlsObj.data.files;
            angular.forEach(presignedFileUrlObjs, function (presignedFileUrlObj, index) {
                $submissionService.uploadFileToS3(presignedFileUrlObj.preSignedUploadUrl,
                    presignedFileUrlObj.mediaType, $scope.submissionArchive).then(
                        function (success) {
                            presignedFileUrlObj.status = 'UPLOADED'
                        });
            });
        };

        
        /**
         * This method validated file size is less than equal to 500 MB
         */
        $scope.valideFileSize = function (file) {
            return file.size / 1048576 <= 500
        }

        
    }
]);
