'use strict';

var module = angular.module('supportAdminApp');

module.controller('NewSubmissionCtrl', ['$scope', 'SubmissionService', '$state',
  function($scope, $submissionService, $state) {

    $scope.newSubmission = {};
    $scope.submissionFile = {};
    $scope.files = {
      "SUBMISSION_ZIP": {},
      "SOURCE_ZIP": {},
      "DESIGN_COVER": {}
    };
    /** List of possible font Sources */
    var initNewSubmission = function(challengeObj) {
      $scope.newSubmission = {
          reference: {
            type: "CHALLENGE",
            id: challengeObj.id
          },
          data: {
            method: challengeObj.track === "DESIGN" ? "DESIGN_CHALLENGE_ZIP_FILE" : "DEVELOP_CHALLENGE_ZIP_FILE",
            files: [],
            fonts: [],
            stockArts: [],
            submitterComments: "",
            submitterRank: 1
          }
        };
    };
    if ($scope.challengeObj) {
      initNewSubmission($scope.challengeObj);
    }
    $scope.selectedChallengePhase = null;
    $scope.$watch('challengeObj', function(newValue, oldValue) {
      if (newValue !== oldValue && newValue !== null) {
        initNewSubmission(newValue);   
      }
    })

    /**
     * This method validates Stock Arts field in the Submission form
     */
    $scope.validateStockArts = function() {
      var isValid = true;
      angular.forEach($scope.stockArts, function(stockArt, index) {
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
    $scope.validateFonts = function() {
      var isValid = true;
      $scope.processedFont = [];
      angular.forEach($scope.submissionFonts, function(submissionFont, index) {
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


    /** Form Helper Functions */
    /**
     * This function adds one more font form in the UI
     */
    $scope.addFont = function() {
      $scope.newSubmission.data.fonts.push({
        fontSource: $scope.fontSources[0],
        name: '',
        sourceUrl: ''
      });
    };

    /**
     * This function adds one more stock art form in the UI
     */
    $scope.addStockArt = function() {
      $scope.newSubmission.data.stockArts.push({
        description: '',
        sourceUrl: '',
        fileNumber: ''
      });
    };

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
     * This function is invoked when the submit form is submitted
     */
    $scope.submitSubmission = function(form) {
      $scope.$broadcast('alert.ClearAll', {});
      $scope.processing = true;
      /** Validates the Submission form */
      var isValid = true;
      // if (!$scope.submission.userHandle) {
      //   $scope.$broadcast('alert.AlertIssued', {
      //     type: 'danger',
      //     message: 'Please enter User handle'
      //   });
      //   isValid = false;
      // } else if (!$scope.submission.selectedChallengePhase) {
      //   $scope.$broadcast('alert.AlertIssued', {
      //     type: 'danger',
      //     message: 'Please select Challenge Phase'
      //   });
      //   isValid = false;
      // } else if (!submissionArchive) {
      //   $scope.$broadcast('alert.AlertIssued', {
      //     type: 'danger',
      //     message: 'Please browse Submission Archieve file'
      //   });
      //   isValid = false;
      // } else if (!$scope.valideFileSize(submissionArchive)) {
      //   $scope.$broadcast('alert.AlertIssued', {
      //     type: 'danger',
      //     message: 'Submission Archieve file should not be more than 500'
      //   });
      //   isValid = false;
      // } else if ($scope.challengeObj.track == 'DESIGN' && !sourceArchive) {
      //   $scope.$broadcast('alert.AlertIssued', {
      //     type: 'danger',
      //     message: 'Please browse Source Archieve file'
      //   });
      //   isValid = false;
      // } else if ($scope.challengeObj.track == 'DESIGN' && !$scope.valideFileSize(sourceArchive)) {
      //   $scope.$broadcast('alert.AlertIssued', {
      //     type: 'danger',
      //     message: 'Source Archieve file should not be more than 500'
      //   });
      //   isValid = false;
      // } else if ($scope.challengeObj.track == 'DESIGN' && !submissionCover) {
      //   $scope.$broadcast('alert.AlertIssued', {
      //     type: 'danger',
      //     message: 'Please browse Submission Cover file'
      //   });
      //   isValid = false;
      // } else if ($scope.challengeObj.track == 'DESIGN' && !$scope.valideFileSize(submissionCover)) {
      //   $scope.$broadcast('alert.AlertIssued', {
      //     type: 'danger',
      //     message: 'Source Archieve file should not be more than 500'
      //   });
      //   isValid = false;
      // } else if ($scope.challengeObj.track == 'DESIGN' && !$scope.validateFonts()) {
      //   isValid = false;
      // } else if ($scope.challengeObj.track == 'DESIGN' && !$scope.validateStockArts()) {
      //   isValid = false;
      // }

      if (isValid) {
        /** Calls the REST endpoint to process and add submission */
        $submissionService.getUserByHandle($scope.addForm.userHandle).then(
          function(responseUser) {
            // user id
            $scope.newSubmission.userId = responseUser.userId;
            // phase data
            $scope.newSubmission.reference.phaseType = $scope.selectedChallengePhase.phaseType;
            $scope.newSubmission.reference.phaseId = $scope.selectedChallengePhase.id;

            if ($scope.challengeObj.track === 'DESIGN') {
              _.forEach(['SUBMISSION_ZIP', 'SOURCE_ZIP', 'DESIGN_COVER'], function(type) {
                $scope.newSubmission.data.files.push({
                  name: $scope.files[type].name,
                  type: type,
                  mediaType: $scope.files[type].type,
                  status: "PENDING"
                });  
              });
            }
            $submissionService.createSubmission($scope.newSubmission).then(
              function(submission) {
                $submissionService.uploadFiles(submission, $scope.files).then(function() {
                  
                  $submissionService.processSubmission(submission).then(function(submission) {
                    console.log("New Submission");
                    console.log(submission);
                    $scope.$broadcast('alert.AlertIssued', {
                      type: "success",
                      message: "Submission submitted."
                    });

                  $state.go('index.submissions.list');
                  }, function(error) {
                    console.log("process submission failed");
                    console.log(error);
                    $scope.$broadcast('alert.AlertIssued', {
                      type: 'danger',
                      message: error.error
                    });
                  });
                }, function(error) {
                  console.log("upload submission failed");
                  console.log(error);
                  $scope.$broadcast('alert.AlertIssued', {
                    type: 'danger',
                    message: error.error
                  });
                });

              },
              function(error) {
                console.log('create submission failed');
                console.log(error);
                $scope.challengeSearch.submissionSubmitted = false;
                $scope.$broadcast('alert.AlertIssued', {
                  type: 'danger',
                  message: error.error
                });
              });
          },
          function(error) {
            $scope.challengeSearch.submissionSubmitted = false;
            $scope.$broadcast('alert.AlertIssued', {
              type: 'danger',
              message: 'User with Handle : ' + $scope.submission.userHandle +
                ' not found'
            });

          }
        );
      } 
    };

  }
]);
