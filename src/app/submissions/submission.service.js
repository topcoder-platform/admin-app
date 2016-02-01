'use strict';

angular.module('supportAdminApp')
    .factory('SubmissionService', ['$q', '$http', 'API_URL', 'DEV_JWT',
        function($q, $http, API_URL, DEV_JWT) {
            return ({
                /**
                 * Find challenge identified by Challenge Id
                 */
                findChallengeById: function(challengeId) {
                    if (!challengeId) {
                        return $q.reject({
                            error: 'Challenge ID must be specified.'
                        });
                    }

                    var request = $http({
                        method: 'GET',
                        url: API_URL + '/v3/challenges/' + challengeId,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
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
                },
                /** 
                 * Find all submission associated with Challenge identified
                 * by challenge Id
                 */
                findSubmissions: function(challengeId) {
                    if (!challengeId) {
                        return $q.reject({
                            error: 'Challenge ID must be specified.'
                        });
                    }
                    var urlParams = encodeURI('filter=reference={"type":"CHALLENGE","id":"' +
                        challengeId + '"}');

                    var request = $http({
                        method: 'GET',
                        url: API_URL + '/v3/submissions?' + urlParams,
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + DEV_JWT
                        }
                    });
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
                },
                /** Saves submission to the backend */
                saveSubmission: function(submissionObj) {
                    var request = $http({
                        method: 'POST',
                        url: API_URL + '/v3/submissions/',
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": "Bearer " + DEV_JWT
                        },
                        data: angular.toJson(submissionObj)
                    });

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
                },
                /**
                 * Fetches details for user identified by userHandle
                 */
                getUserByHandle: function(userHandle) {
                    var request = $http({
                        method: 'GET',
                        url: API_URL + '/v3/members/' + userHandle,
                        headers: {
                            "Content-Type": "application/json"
                        }
                    });
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
                },
                /**
                 * Uploads file to Amazon S3 pre signed url
                 */
                uploadFileToS3: function(signedURL, mediaType, file) {
                    var fd = new FormData();
                    fd.append('file', file);
                    var request = $http({
                        method: 'PUT',
                        url: signedURL,
                        headers: {
                            "Content-Type": mediaType
                        },
                        data: fd
                    });
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
                }

            });
        }
    ]);