'use strict';

angular.module('supportAdminApp')
  .factory('SubmissionService', ['$q', '$http', 'API_URL', '$log',
      function($q, $http, API_URL, $log) {

        var service = {
          getChallengePhases: getChallengePhases,
          findChallengeById: findChallengeById,
          findSubmissions: findSubmissions,
          createSubmission: createSubmission,
          updateSubmission: updateSubmission,
          processSubmission: processSubmission,
          uploadFiles: uploadFiles,
          getUserByHandle: getUserByHandle
        }

        /**
         * helper function to process http request
         */
        var _processRequest = function(request) {
          return request.then(
            function(response) {
              return response.data.result.content;
            },
            function(error) {
              var err;
              if (error && error.data && error.data.result) {
                err = {
                  status: error.status,
                  error: error.data.result.content
                };
              }
              if (!err) {
                err = {
                  status: error.status,
                  error: error.statusText
                };
              }
              return $q.reject(err);
            }
          );
        };

        return service;
        /**
         * retrieve challenge phases
         */
        function getChallengePhases(challengeId) {
          if (!challengeId) {
            return $q.reject({
              error: 'Challenge ID must be specified.'
            });
          }
          var request = $http({
            method: 'GET',
            url: API_URL + '/v3/challenges/' + challengeId + '/phases/',
            headers: {
              "Content-Type": "application/json"
            }
          });
          return request.then(
            function(response) {
              if (Array.isArray(response.data.result.content) && response.data.result.content.length > 0) {
                var phases = [];
                _(response.data.result.content).forEach(function(p) {
                  // adding space seperated phase info for backward compatibility.
                  var submittablePhases = [
                    'SUBMISSION',
                    'CHECKPOINT_SUBMISSION', 'CHECKPOINT SUBMISSION',
                    'FINAL_FIX', 'FINAL FIX',
                  ];
                  if (_.indexOf(submittablePhases, p.phaseType.toUpperCase()) > -1) {
                    // updating phase type to match constants. 
                    // This can be revmoved once challenge service uses 'constants'
                    p.phaseType = p.phaseType.replace(/\s+/g, "_").toUpperCase();
                    p.actualEndTime /= 1000;
                    p.scheduledEndTime /= 1000;
                    p.scheduledStartTime /= 1000;
                    p.actualStartTime /= 1000;
                    p.fixedStartTime /= 1000;
                    phases.push({
                      name: p.phaseType,
                      value: p
                    });
                  }
                });
                return phases;

              } else {
                return $q.reject("Challenge phases not found");
              }
            },
            function(error) {
              var err;
              if (error && error.data && error.data.result) {
                err = {
                  status: error.status,
                  error: error.data.result.content
                };
              }
              if (!err) {
                err = {
                  status: error.status,
                  error: error.statusText
                };
              }
              return $q.reject(err);
            }
          );
        };
        /**
         * Find challenge identified by Challenge Id
         */
        function findChallengeById(challengeId) {
          if (!challengeId) {
            return $q.reject({
              error: 'Challenge ID must be specified.'
            });
          }

          var request = $http({
            method: 'GET',
            url: API_URL + '/v3/challenges/?filter=id%3D' + challengeId,
            headers: {
              "Content-Type": "application/json"
            }
          });
          return request.then(
            function(response) {
              if (Array.isArray(response.data.result.content) && response.data.result.content.length > 0) {
                return response.data.result.content[0];
              } else {
                return $q.reject("Challenge with '" + challengeId + "' not found.");
              }
            },
            function(error) {
              var err;
              if (error && error.data && error.data.result) {
                err = {
                  status: error.status,
                  error: error.data.result.content
                };
              }
              if (!err) {
                err = {
                  status: error.status,
                  error: error.statusText
                };
              }
              return $q.reject(err);
            }
          );
        };

        /** 
         * Find all submission associated with Challenge identified
         * by challenge Id
         */
        function findSubmissions(challengeId) {
          if (!challengeId) {
            return $q.reject({
              error: 'Challenge ID must be specified.'
            });
          }
          var filterParams = encodeURIComponent('reference={"type":"CHALLENGE","id":"' + challengeId + '"}');

          var request = $http({
            method: 'GET',
            url: API_URL + '/v3/submissions/?filter=' + filterParams,
            headers: {
              "Content-Type": "application/json"
            }
          });
          return _processRequest(request);
        };
        /**
         * creates a submission
         */
        function createSubmission(submission) {
          var request = $http({
            method: 'POST',
            url: API_URL + '/v3/submissions/',
            headers: {
              "Content-Type": "application/json"
            },
            data: angular.toJson({
              param: submission
            })
          });
          return _processRequest(request);
        };

        /** Saves submission to the backend */
        function processSubmission(submission) {
          var request = $http({
            method: 'POST',
            url: API_URL + '/v3/submissions/' + submission.id + '/process/',
            headers: {
              "Content-Type": "application/json"
            },
            data: angular.toJson({
              param: submission
            })
          });
          return _processRequest(request);
        };
        /**
         * Fetches details for user identified by userHandle
         */
        function getUserByHandle(userHandle) {
          var request = $http({
            method: 'GET',
            url: API_URL + '/v3/members/' + userHandle,
            headers: {
              "Content-Type": "application/json"
            }
          });
          return _processRequest(request);
        };

        /**
         * Uploads file to Amazon S3 pre signed url
         */
        function uploadFiles(submission, files, progressCallback) {

          var promises = submission.data.files.map(function(file) {

            var deferred = $q.defer();
            var xhr = new XMLHttpRequest();

            xhr.open('PUT', file.preSignedUploadUrl, true);
            xhr.setRequestHeader('Content-Type', file.mediaType);

            // xhr.upload.addEventListener("progress", function(oEvent) {
            //   if (oEvent.lengthComputable) {
            //     var percentComplete = oEvent.loaded / oEvent.total;
            //     // console.log("Completed " + percentComplete);
            //     if (progressCallback && typeof progressCallback === 'function') {
            //       progressCallback.call(progressCallback, 'UPLOAD', {
            //         file: file.preSignedUploadUrl,
            //         progress: percentComplete*100
            //       });
            //     }
            //     // ...
            //   } else {
            //     // Unable to compute progress information since the total size is unknown
            //   }
            // });

            // xhr version of the success callback
            xhr.onreadystatechange = function() {
              var status = xhr.status;
              if (((status >= 200 && status < 300) || status === 304) && xhr.readyState === 4) {
                $log.info('Successfully uploaded file');
                console.log('xhr response: ', xhr.responseText);

                // updateSubmissionStatus and then resolve?
                deferred.resolve();

              } else if (status >= 400) {
                $log.error('Error uploading to S3 with status: ' + status);
                toaster.pop('error', 'Whoops!', 'There was an error uploading your files. Please try again later.');
                deferred.reject(err);
              }
            };

            xhr.onerror = function(err) {
              $log.info('Error uploading to s3');
              toaster.pop('error', 'Whoops!', 'There was an error uploading your files. Please try again later.');
              deferred.reject(err);
            }
            xhr.send(files[file.type]);

            return deferred.promise;
          });
          return $q.all(promises)
            .then(function(response) {
              console.log('response from S3: ', response);
              // console.log('response to use .save restnagular with: ', presignedURLResponse);
              // progressCallback.call(progressCallback, 'UPLOAD', 100);
              // Update and start processing
              // updateSubmissionStatus(presignedURLResponse.plain(), progressCallback);
              submission.data.files.forEach(function(f) {
                f.status = 'UPLOADED';
              });

              return updateSubmission(submission);
            })
            .catch(function(err) {
              // progressCallback.call(progressCallback, 'ERROR', err);
              console.log('error uploading to S3: ', err);
              return err;
            });
        };

        /**
         * Update an existing submission
         */
        function updateSubmission(submission) {
          var request = $http({
            method: "PUT",
            url: API_URL + "/v3/submissions/" + submission.id + "/",
            headers: {
              "Content-Type": "application/json"
            },
            data: angular.toJson({
              param: submission
            })
          });
          return _processRequest(request);
        };

  }
]);
