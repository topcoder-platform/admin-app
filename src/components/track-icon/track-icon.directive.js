(function() {
  'use strict'

  angular.module('supportAdminApp').directive('trackIcon', trackIcon)

  function trackIcon() {
    return {
      restrict: 'AE',
      replace: true,
      scope: {
          track: '@',
          type: '='
      },
      templateUrl: 'components/track-icon/track-icon.directive.html',
      link: function(scope, element, attr) {
          scope.trackStyle = scope.track.replace(' ', '-').toLowerCase();
      }
    }
  }
})(); // add ";" to avoid issues after building into one file
