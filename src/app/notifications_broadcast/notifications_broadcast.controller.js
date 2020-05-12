'use strict';

var module = angular.module('supportAdminApp');

/**
 * The notification broadcast controller.
 */
module.controller('notification.BroadcastController', [
  '$scope',
  '$rootScope',
  '$q',
  'AuthService',
  'NotificationService',
  'GroupService',
  'TRACKS',
  'Alert',
  function (
    $scope,
    $rootScope,
    $q,
    $authService,
    notificationService,
    groupService,
    availableTracks,
    $alert
  ) {
    /**
     * Check if user is logged in
     */
    $scope.authorized = function () {
      return $authService.isLoggedIn();
    };

    /**
     * Object storing state of notification broadcast
     */
    $scope.notificationBroadcast = {
      isLoading: false,
      announcement: '',
      recipients: {
        groups: [],
        skills: [],
        tracks: [],
        countryCodes: [],
      }
    };

    // The selected countries in the ui
    $scope.selectedCountries = []

    // The data available in the system, used to populate the drop-down lists
    $scope.availableGroups = [];
    $scope.availableSkills = [];
    $scope.availableTracks = availableTracks;
    $scope.availableCountries = [];

    /**
     * This function loads the data from the backend, and populates the fields used by drop down lists
     */
    $scope.loadData = function () {
      $scope.notificationBroadcast.isLoading = true;
      var promises = [
        groupService.fetch({ perPage: Number.MAX_SAFE_INTEGER }),
        notificationService.getAllAvailableSkills(),
        notificationService.getAllAvailableCountries()
      ];

      // load the drop down data in parallel
      $q.all(promises)
        .then(function (results) {
          var groups = results[0];
          var skills = results[1];
          var countries = results[2];
          //populate the groups drop down list data, only active groups are considered
          groups.forEach(function (group) {
            if (group.status === 'active')
              $scope.availableGroups.push(group.name);
          });

          // populate the available skills drop down list data
          skills.forEach(function (skill) {
            if (skill.status === 'APPROVED') {
              $scope.availableSkills.push(skill.name);
            }
          });
          
          // populate the countries data
          countries.forEach(function(country) {
            $scope.availableCountries.push({
              name: country.name,
              countryCode: country.countryCode
            })
          })
          $scope.notificationBroadcast.isLoading = false;
        })
        .catch(function (error) {
          $alert.error(
            'An error occured when loading the data: ' + error.error,
            $rootScope
          );
        });
    };

    // Watches the changes of the selected countries and updates the countryCodes to send to the backend
    $scope.$watch('selectedCountries', function() {
      $scope.notificationBroadcast.recipients.countryCodes = $scope.selectedCountries.map(
        function(ctr) { return ctr.countryCode})
    }) 

    /**
     * This function sends the announcement to the selected recipients.
     */
    $scope.sendAnnouncement = function () {
      var recipients = $scope.notificationBroadcast.recipients;
      var announcement = $scope.notificationBroadcast.announcement;
      if (
        !confirm(
          'Are you sure you want to post this notification to the following groups: ' +
            recipients.groups.join(', ')
        )
      ) {
        return;
      }
      // Send the notification
      notificationService.broadcastNotification(announcement, recipients).then(
        function (response) {
          $alert.info('The notification has been successfully sent')
          // clean the announcement text and the selected recipients
          $scope.notificationBroadcast.announcement = '';
          $scope.notificationBroadcast.recipients.groups = [];
          $scope.notificationBroadcast.recipients.skills = [];
          $scope.notificationBroadcast.recipients.tracks = [];
          $scope.notificationBroadcast.recipients.countryCodes = [];
          $scope.selectedCountries = [];
        },
        function (error) {
          $alert.error('An error occured when broadcasting the notification: ' + error.error, $rootScope);
        }
      );
    };

    $scope.loadData();
  },
]);
