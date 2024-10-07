'use strict';

angular.module('supportAdminApp').factory('ReviewerService', [
    '$log',
    '$q',
    '$http',
    'REVIEW_SERVICE_V5_API_URL',
    function ($log, $q, $http, REVIEW_SERVICE_V5_API_URL) {
        var ReviewerService = {};

        /**
         * Get a list of all the review summaries
         * @return {Promise} promise to fetch review summaries
         */
        ReviewerService.fetch = function () {
            return $http({
                method: 'GET',
                url: ReviewerService.getBasePath() + '/reviewOpportunities/reviewApplicationsSummary/',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(function (response) {
                    if (response && response.data) {
                        return response.data || [];
                    } else {
                        return $q.reject({
                            error: 'Cannot find data in response'
                        });
                    }
                })
                .catch(ReviewerService.handleError);
        };
        /**
         * Get a list of applications for a given legacy challenge ID
         * @return {Promise} promise to fetch review applications
         */
        ReviewerService.getApplicationsForChallenge = function (challengeId) {
            return $http({
                method: 'GET',
                url: ReviewerService.getBasePath() + '/reviewOpportunities/' + challengeId + '/reviewApplications/',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(function (response) {
                    if (response && response.data) {
                        return response.data || [];
                    } else {
                        return $q.reject({
                            error: 'Cannot find data in response'
                        });
                    }
                })
                .catch(ReviewerService.handleError);
        };

        /**
         * Approves a review application
         * @return {Promise} approval promise
         */
        ReviewerService.approveApplication = function (application, challengeId) {
            return $http({
                method: 'POST',
                url: ReviewerService.getBasePath() + '/reviewOpportunities/' + challengeId + '/reviewApplications/assign?userId=' + application.userId 
                + '&reviewAuctionId=' + application.reviewAuctionId 
                    + '&applicationRoleId=' + application.applicationRoleId,
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            .then(function (response) {
                if (response && response.data) {
                    return response.data || [];
                } else {
                    return $q.reject({
                        error: 'Cannot find data in response'
                    });
                }
            })
            .catch(ReviewerService.handleError);
        };

        /**
         * Rejects all pending applications, used when all reviewer slots have been assigned and we want to let all 
         * other members that applied know their applications have been unsuccessful
         * @return {Promise} reject pending promise
         */
        ReviewerService.rejectPending = function (challengeId) {
            return $http({
                method: 'POST',
                url: ReviewerService.getBasePath() + '/reviewOpportunities/' + challengeId + '/reviewApplications/rejectPending',
                headers: {
                    'Content-Type': 'application/json'
                }
            })
                .then(function (response) {
                    if (response && response.data) {
                        return response.data || [];
                    } else {
                        return $q.reject({
                            error: 'Cannot find data in response'
                        });
                    }
                })
                .catch(ReviewerService.handleError);
        };

        /**
         * Handle API response error
         *
         * @param  {Error}   error    the error as received in catch callback
         * @return {Promise}          rejected promise with error
         */
        ReviewerService.handleError = function (error) {
            var err;

            $log.error(error);

            if (error && error.data) {
                err = {
                    status: error.status,
                    error: error.data.message
                };
            }

            if (!err) {
                err = {
                    status: error.status,
                    error: error.message
                };
            }

            return $q.reject(err);
        };

        /**
         * Get base API path
         *
         * @return {String} base path
         */
        ReviewerService.getBasePath = function () {
            return REVIEW_SERVICE_V5_API_URL;
        };

        return ReviewerService;
    }
]);
