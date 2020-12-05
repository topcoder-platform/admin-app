'use strict';

var module = angular.module('supportAdminApp');

module.controller('v5challenge.DetailController', ['$scope', '$rootScope', 'AuthService', 'ChallengeService', 'Alert', '$stateParams', '$state',
    function ($scope, $rootScope, $authService, $challengeService, $alert, $stateParams, $state) {
        $scope.isLoading = true;
        $scope.pageTitle = $state.current.data.pageTitle;
        $scope.challenge = {};
        $scope.id = $stateParams.id;
        $scope.challengeData = '';
        $scope.error = false;

        /**
         * Check if user is logged in.
         */
        $scope.authorized = function () {
            return $authService.isLoggedIn();
        };

        /**
         * prettify the json.
         * @param {object} json the json.
         * @param {boolean} prettify check if prettify.
         */
        function prettifyJson(json, prettify) {
            if (typeof json !== 'string') {
                if (prettify) {
                    json = JSON.stringify(json, null, 2);
                } else {
                    json = JSON.stringify(json);
                }
            }
            return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g,
                function (match) {
                    if (/^"/.test(match)) {
                        if (/:$/.test(match)) {
                            return '<b>' + match + '</b>';
                        }
                    }
                    var entityMap = {
                        "&": "&amp;",
                        "<": "&lt;",
                        ">": "&gt;",
                        '"': '&quot;',
                        "'": '&#39;',
                        "/": '&#x2F;'
                    };
                    return match.replace(/[&<>"'\/]/g, function (s) {
                        return entityMap[s];
                    });
                }
            );
        };

        // fetch challenge detail, either by id(string) or legacyId(number)
        var getChallengeDetail;
        if (isNaN($stateParams.id))
            getChallengeDetail = $challengeService.v5.getChallengeById($stateParams.id);
        else
            getChallengeDetail = $challengeService.v5.getChallengeByLegacyId($stateParams.id);
        getChallengeDetail.then(function (data) {
            $scope.challenge = data;
            $scope.challengeData = prettifyJson(data, true);
        }).catch(function (error) {
            $alert.error(error.error, $rootScope);
            $scope.error = true;
        }).finally(function () {
            $scope.isLoading = false;
        });
    }
]);