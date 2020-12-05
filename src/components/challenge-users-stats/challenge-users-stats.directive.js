(function() {
  'use strict'

  angular.module('supportAdminApp').directive('challengeUsersStats', challengeUsersStats)

  function challengeUsersStats() {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
          challenge: '=',
      },
      templateUrl: 'components/challenge-users-stats/challenge-users-stats.directive.html',
      link: function(scope, element, attr) {
          scope.registrants = scope.challenge.numOfRegistrants;
          scope.submissions = scope.challenge.numOfSubmissions;
          scope.groups = scope.challenge.groups.length;
      }
    }
  }
})()
