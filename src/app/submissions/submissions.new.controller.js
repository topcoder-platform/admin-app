'use strict';

var module = angular.module('supportAdminApp');

module.controller('NewSubmissionCtrl', ['$scope', 'SubmissionService', '$state', '$log',
  function($scope, $submissionService, $state, $log) {

    $scope.newSubmission = {};
    $scope.submissionFile = {};
    $scope.files = {
      "SUBMISSION_ZIP": {},
      "SOURCE_ZIP": {},
      "DESIGN_COVER": {}
    };
    $scope.processing = false;
    $scope.preparing = false;
    $scope.uploading = false;
    $scope.finishing = false;
    $scope.uploadProgress = 0;
    var fileUploadProgress = {};
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
      $scope.errorInUpload = false;
      $scope.uploadProgress = 0;
      fileUploadProgress = {};
      $scope.processing = true;
      $scope.preparing = true;
      $scope.uploading = false;
      $scope.finishing = false;
      /** Validates the Submission form */
      var isValid = true;
      // Todo - add more validations

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
                updateProgress('PREPARE', 100);
                $submissionService.uploadFiles(submission, $scope.files, updateProgress).then(function() {
                  
                  $submissionService.processSubmission(submission).then(function(submission) {
                    console.log("New Submission");
                    console.log(submission);
                    updateProgress('FINISH', 100);
                    $scope.$broadcast('alert.AlertIssued', {
                      type: "success",
                      message: "Submission submitted."
                    });

                    $state.go('index.submissions.list');
                  }, function(error) {
                    console.log("process submission failed");
                    console.log(error);
                    updateProgress('ERROR', error);
                    $scope.$broadcast('alert.AlertIssued', {
                      type: 'danger',
                      message: error.error
                    });
                  });
                }, function(error) {
                  console.log("upload submission failed");
                  console.log(error);
                  updateProgress('ERROR', error);
                  $scope.$broadcast('alert.AlertIssued', {
                    type: 'danger',
                    message: error.error
                  });
                });

              },
              function(error) {
                console.log('create submission failed');
                console.log(error);
                updateProgress('ERROR', error);
                $scope.challengeSearch.submissionSubmitted = false;
                $scope.$emit('alert.AlertIssued', {
                  type: 'danger',
                  message: error.error
                });
              });
          },
          function(error) {
            $scope.challengeSearch.submissionSubmitted = false;
            updateProgress('ERROR', error);
            $scope.$broadcast('alert.AlertIssued', {
              type: 'danger',
              message: 'User with Handle : ' + $scope.submission.userHandle +
                ' not found'
            });

          }
        );
      } 
    };

    // Callback for updating submission upload process. It looks for different phases e.g. PREPARE, UPLOAD, FINISH
    // of the submission upload and updates the progress UI accordingly.
    function updateProgress(phase, args) {
      // for PREPARE phase
      if (phase === 'PREPARE') {
        // we are concerned only for completion of the phase
        if (args === 100) {
          $scope.preparing = false
          $scope.uploading = true
          $log.debug('Prepared for upload.')
        }
      } else if (phase === 'UPLOAD') {
        // if args is object, this update is about XHRRequest's upload progress
        if (typeof args === 'object') {
          var requestId = args.file
          var progress = args.progress
          if (!fileUploadProgress[requestId] || fileUploadProgress[requestId] < progress) {
            fileUploadProgress[requestId] = progress
          }
          var total = 0, count = 0
          for(var requestIdKey in fileUploadProgress) {
            var prog = fileUploadProgress[requestIdKey]
            total += prog
            count++
          }
          $scope.uploadProgress = total / count

          // initiate digest cycle because this event (xhr event) is caused outside angular
          $scope.$apply()
        } else { // typeof args === 'number', mainly used a s fallback to mark completion of the UPLOAD phase
          $scope.uploadProgress = args
        }

        // start next phase when UPLOAD is done
        if ($scope.uploadProgress == 100) {
          $log.debug('Uploaded files.')
          $scope.uploading = false
          $scope.finishing = true
        }
      } else if (phase === 'FINISH') {
        // we are concerned only for completion of the phase
        if (args === 100) {
          $log.debug('Finished upload.')
        }
      } else {
        // assume it to be error condition
        $log.debug('Error Condition: ' + phase);  
        $scope.errorInUpload = true
        $scope.processing = false;
        $scope.error = args;
      }
    }

  }
]);
