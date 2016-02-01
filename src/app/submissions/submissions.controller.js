'use strict';

var module = angular.module('supportAdminApp');

module.controller('submissions.SearchController', ['$scope', '$rootScope', '$timeout', '$state', '$modal',
    'AuthService', 'SubmissionService', 'UserService',
    function ($scope, $rootScope, $timeout, $state, $modal, $authService, $submissionService, $userService) {

        angular.element(document).ready(function () {
            $('.footable').footable({
                addRowToggle: true
            });
        });

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
        $scope.challengeObj = {};

        $scope.showAddSubmissionForm = false;
        $scope.isValidChallenge = false;
        $scope.challengePhases = [];
        $scope.selectedChallengePhase = {};

        /** List of possible font Sources */
        $scope.fontSources = [{
            value: '-1',
            name: 'Pick From the list'
        }, {
                value: 'STUDIO_STANDARD_FONTS_LIST',
                name: 'Studio Standard Fonts List'
            }, {
                value: 'FONTS_DOT_COM',
                name: 'Fonts.com'
            }, {
                value: 'MYFONTS',
                name: 'MyFonts'
            }, {
                value: 'ADOBE_FONTS',
                name: 'Adobe Fonts'
            }, {
                value: 'FONT_SHOP',
                name: 'Font Shop'
            }, {
                value: 'T26_DIGITAL_TYPE_FOUNDRY',
                name: 'T.26 Digital Type Foundry'
            }, {
                value: 'FONT_SQUIRREL',
                name: 'Font Squirrel'
            }, {
                value: 'TYPOGRAPHY_DOT_COM',
                name: 'Typography.com'
            }];

        /**
         * Set of Challenge Phases
         * In future to be dynamically picked from API
         */
        $scope.challengePhases = [{
            value: 'SUBMISSION',
            name: 'Submission'
        }, {
                value: 'CHECKPOINT_SUBMISSION',
                name: 'Checkpoint submission'
            }, {
                value: 'FINAL_FIX',
                name: 'Final Fix'
            }]

        /** 
         * Default empty record for Font
         */
        $scope.submissionFonts = [];

        /** 
         * Default empty record for Stock Art
         */
        $scope.stockArts = [];
        /** Captures newly submitted submission for challenge*/
        $scope.submission = {};
        $scope.processedFont = [];
        /** Captures list of submission by challenge */
        $scope.submissions = [];

        /**
         * This method finds challenge by ChallengeId and 
         * list of Submissions for challenge 
         */
        $scope.findChallenge = function () {
            $scope.$broadcast('alert.ClearAll', {});
            $scope.challengeSearch.isLoading = true;
            $scope.challengeSearch.addSubmission = false;
            $scope.submissions = [];
            $scope.submission = {};
            $scope.challengeObj = {};
            /** Fetches Challenge Details  */
            $submissionService.findChallengeById($scope.challengeSearch.challengeId).then(
                function (responseChallenge) {
                    /** 
                     * This code can be used once challenge starts returning 
                     * name of valid phases with phase ID. Commented for now
                     */
                    /** Prepares list of Challenge Phases associated with challenge */
                    /**if (responseChallenge.currentPhases) {
                        angular.forEach(responseChallenge.currentPhases, function(currentPhase, key) {
                            $scope.challengePhases.push(currentPhase);
                        });
                    }**/
                    $scope.challengeObj = responseChallenge;
                    /** Fetches List of Submission for Challenge  */
                    $submissionService.findSubmissions($scope.challengeSearch.challengeId).then(
                        function (responseSubmissions) {
                            $scope.challengeSearch.challengeFound = true;
                            $scope.challengeSearch.isLoading = false;
                            $scope.submissions = responseSubmissions;
                            $timeout(function () {
                                $('.footable').trigger('footable_redraw');
                            }, 100);
                        },
                        function (error) {
                            $scope.$broadcast('alert.AlertIssued', {
                                type: 'danger',
                                message: error.error
                            });
                            $scope.challengeSearch.setLoading(false);
                        }
                        );
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
         * Sets add submission to true indicating form to add
         * submission needs to be displayed
         */
        $scope.addSubmission = function () {
            $scope.$broadcast('alert.ClearAll', {});
            $scope.challengeSearch.addSubmission = true;
            /** Intialize variables for submission form */
            $scope.submission = {};
            $scope.processedFont = [];
            $scope.submissionFonts = [{
                source: $scope.fontSources[0],
                name: '',
                sourceUrl: ''
            }];
            $scope.stockArts = [{
                description: '',
                sourceUrl: '',
                fileNumber: ''
            }];
            $scope.selectedChallengePhase = {};
            $scope.submissionArchive = null;
            $scope.sourceArchive = null;
            $scope.submissionCover = null;
            $('#submission-archive-fileName').val('');
            $('#source-archive-fileName').val('');
            $('#submission-cover-fileName').val('');
        };

        /**
         * This function is invoked when the submit form is submitted
         */
        $scope.submitSubmission = function () {
            $scope.$broadcast('alert.ClearAll', {});
            $scope.challengeSearch.submissionSubmitted = true;
            var submissionArchive = $scope.submissionArchive;
            var sourceArchive = $scope.sourceArchive;
            var submissionCover = $scope.submissionCover;
            /** Validates the Submission form */
            var isValid = true;
            if (!$scope.submission.userHandle) {
                $scope.$broadcast('alert.AlertIssued', {
                    type: 'danger',
                    message: 'Please enter User handle'
                });
                isValid = false;
            } else if (!$scope.submission.selectedChallengePhase || !$scope.submission.selectedChallengePhaseId) {
                $scope.$broadcast('alert.AlertIssued', {
                    type: 'danger',
                    message: 'Please select Challenge Phase'
                });
                isValid = false;
            } else if (!submissionArchive) {
                $scope.$broadcast('alert.AlertIssued', {
                    type: 'danger',
                    message: 'Please browse Submission Archieve file'
                });
                isValid = false;
            }
            else if (!$scope.valideFileSize(submissionArchive)) {
                $scope.$broadcast('alert.AlertIssued', {
                    type: 'danger',
                    message: 'Submission Archieve file should not be more than 500'
                });
                isValid = false;
            }
            else if ($scope.challengeObj.track == 'DESIGN' && !sourceArchive) {
                $scope.$broadcast('alert.AlertIssued', {
                    type: 'danger',
                    message: 'Please browse Source Archieve file'
                });
                isValid = false;
            } else if ($scope.challengeObj.track == 'DESIGN' && !$scope.valideFileSize(sourceArchive)) {
                $scope.$broadcast('alert.AlertIssued', {
                    type: 'danger',
                    message: 'Source Archieve file should not be more than 500'
                });
                isValid = false;
            } else if ($scope.challengeObj.track == 'DESIGN' && !submissionCover) {
                $scope.$broadcast('alert.AlertIssued', {
                    type: 'danger',
                    message: 'Please browse Submission Cover file'
                });
                isValid = false;
            } else if ($scope.challengeObj.track == 'DESIGN' && !$scope.valideFileSize(submissionCover)) {
                $scope.$broadcast('alert.AlertIssued', {
                    type: 'danger',
                    message: 'Source Archieve file should not be more than 500'
                });
                isValid = false;
            } else if ($scope.challengeObj.track == 'DESIGN' && !$scope.submission.submitterRank) {
                $scope.$broadcast('alert.AlertIssued', {
                    type: 'danger',
                    message: 'Please enter valid submitter rank'
                });
                isValid = false;
            } else if ($scope.challengeObj.track == 'DESIGN' && !$scope.submission.submitterComments) {
                $scope.$broadcast('alert.AlertIssued', {
                    type: 'danger',
                    message: 'Please enter submitter comment'
                });
                isValid = false;
            } else if ($scope.challengeObj.track == 'DESIGN' && !$scope.validateFonts()) {
                isValid = false;
            } else if ($scope.challengeObj.track == 'DESIGN' && !$scope.validateStockArts()) {
                isValid = false;
            }

            if (isValid) {
                /** Calls the REST endpoint to process and add submission */
                $submissionService.getUserByHandle($scope.submission.userHandle).then(
                    function (responseUser) {
                        $scope.submission.userId = responseUser.userId;

                        var submissionArchieveObj = {
                            name: submissionArchive.name,
                            mediaType: "application/octet-stream",
                            type: "SUBMISSION_ZIP",
                            status: "PENDING"
                        };
                        var submissionFiles = [submissionArchieveObj];
                        var fileSubmissionMethod = 'DEVELOP_CHALLENGE_ZIP_FILE';
                        if ($scope.challengeObj.track == 'DESIGN') {
                            var sourceArchieveObj = {
                                name: sourceArchive.name,
                                mediaType: "application/octet-stream",
                                type: "SOURCE_ZIP",
                                status: "PENDING"
                            };
                            var submissionCoverObj = {
                                name: submissionCover.name,
                                mediaType: "image/png",
                                type: "DESIGN_COVER",
                                status: "PENDING"
                            };
                            submissionFiles.push(sourceArchieveObj);
                            submissionFiles.push(submissionCoverObj);
                            fileSubmissionMethod = 'DESIGN_CHALLENGE_ZIP_FILE';
                        }
                        /** Creates submission API payload */
                        var submissionObj = {
                            param: {
                                reference: {
                                    type: "CHALLENGE",
                                    id: $scope.challengeSearch.challengeId,
                                    phaseType: $scope.submission.selectedChallengePhase,
                                    phaseId: $scope.submission.selectedChallengePhaseId
                                },
                                userId: $scope.submission.userId,
                                data: {
                                    method: fileSubmissionMethod,
                                    files: submissionFiles,
                                    submitterRank: $scope.submission.submitterRank,
                                    submitterComments: $scope.submission.submitterComments
                                },
                            }
                        };
                        if ($scope.challengeObj.track == 'DESIGN') {
                            submissionObj.param.data.stockArts = $scope.stockArts;
                            submissionObj.param.data.fonts = $scope.processedFont;
                        }

                        $submissionService.saveSubmission(submissionObj).then(
                            function (responseAddSubmissions) {
                                $scope.challengeSearch.submissionSubmitted = false;
                                $scope.$broadcast('alert.AlertIssued', {
                                    type: 'success',
                                    message: 'New submission successfully added'
                                });
                                $scope.challengeSearch.addSubmission = false;
                                $scope.submission = {};
                                /**Commented call to s3 webservice as per discussion in forum*/
                                //$scope.uploadFile(responseAddSubmissions);
                            },
                            function (error) {

                                $scope.challengeSearch.submissionSubmitted = false;
                                $scope.$broadcast('alert.AlertIssued', {
                                    type: 'danger',
                                    message: error.error
                                });

                            }
                            );
                    },
                    function (error) {
                        $scope.challengeSearch.submissionSubmitted = false;
                        $scope.$broadcast('alert.AlertIssued', {
                            type: 'danger',
                            message: 'User with Handle : ' + $scope.submission.userHandle +
                            ' not found'
                        });

                    }
                    );
            } else {
                $scope.challengeSearch.submissionSubmitted = false;
            }
        };

        /**
         * This method uploads list of submission files to S3
         */
        $scope.uploadFile = function (presignedUrlsObj) {
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

        /** Form Helper Functions */
        /**
         * This function adds one more font form in the UI
         */
        $scope.addFont = function () {
            $scope.submissionFonts.push({
                fontSource: $scope.fontSources[0],
                name: '',
                sourceUrl: ''
            });
        };

        /**
         * This function adds one more stock art form in the UI
         */
        $scope.addStockArt = function () {
            $scope.stockArts.push({
                description: '',
                sourceUrl: '',
                fileNumber: ''
            });
        };

        /**
         * This method validates Stock Arts field in the Submission form
         */
        $scope.validateStockArts = function () {
            var isValid = true;
            angular.forEach($scope.stockArts, function (stockArt, index) {
                if (stockArt.description == '' && stockArt.sourceUrl == '' && stockArt.fileNumber ==
                    '') {
                    /** Since none of values are entered ignoring  */
                    $scope.stockArts.splice(index, 1);
                } else if (stockArt.description == '' || stockArt.sourceUrl == '' || stockArt.fileNumber ==
                    '') {
                    /** Since none of values are entered ignoring  */
                    $scope.$broadcast('alert.AlertIssued', {
                        type: 'danger',
                        message: 'Please Enter StockArt Description,SourceURL and FileNumber'
                    });
                    isValid = false;
                    return false;
                }
            });
            return isValid;
        };

        /**
         * This method validates Fonts field in the Submission form 
         */
        $scope.validateFonts = function () {
            var isValid = true;
            $scope.processedFont = [];
            angular.forEach($scope.submissionFonts, function (submissionFont, index) {
                if (submissionFont.source.value == '-1') {
                    if (!submissionFont.name || !submissionFont.sourceUrl) {
                        $scope.$broadcast('alert.AlertIssued', {
                            type: 'danger',
                            message: 'Please Enter Font Name and SourceUrl'
                        });
                        isValid = false;
                        return false;
                    } else {
                        var font = new Object();
                        /** Temporarily enum value for custom fonts */
                        font.source = 'DID_NOT_INTRODUCE_NEW_FONTS';
                        font.name = submissionFont.name;
                        font.sourceUrl = submissionFont.sourceUrl;
                        $scope.processedFont.push(font);
                    }
                } else {
                    var font = new Object();
                    font.name = submissionFont.source.name;
                    font.source = submissionFont.source.value;
                    font.sourceUrl = null;
                    $scope.processedFont.push(font);
                }
            });
            return isValid;
        };
    }
]);