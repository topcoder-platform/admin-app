'use strict';

var module = angular.module('supportAdminApp');

module.controller('IdeaListController', ['$scope', '$rootScope', '$log','IdeaService', 'Alert', '$timeout', 'OAuth2Service', '$uibModal',
  function ($scope, $rootScope, $log, IdeaService, $alert, $timeout, OAuth2Service,  $modal) {


    // search
    $scope.formSearch = {
      isLoading: false,
      criteria: {  },
      setLoading: function(loading) {
        this.isLoading = loading;
      }
    };

    // list data
    $scope.ideas = [];

    $scope.getIdeaList = function () {
      $alert.clear();
      $scope.ideas = [];

      $scope.formSearch.setLoading(true);
      this.refreshToken();
    }

    /**
     * Search ideas
     * Current implementation will return list of ideas
     */
    $scope.search = function () {
      IdeaService.getIdeaList($scope.formSearch.criteria.domain, $scope.formSearch.criteria.communityId, $scope.formSearch.criteria.stageId).then(function (data) {
        $scope.ideas = data.content;
        $scope.totalIdeas = data.total_count;
        $scope.formSearch.setLoading(false);
      }).catch(function (error) {
        $alert.error(error.error, $scope);
        $scope.formSearch.setLoading(false);
      });
    };

    /**
     * Refresh OAuth Token
     */
    $scope.refreshToken = function () {
      OAuth2Service.refreshToken($scope.formSearch.criteria.username, $scope.formSearch.criteria.password, $scope.formSearch.criteria.domain, $scope.formSearch.criteria.clientId).then(function (data) {
        $scope.currentDomain = $scope.formSearch.criteria.domain;
        $scope.search();
      }).catch(function (error) {
        $alert.error(error.error, $rootScope);
        $scope.formSearch.setLoading(false);
      });
    }

    $scope.openDetailDialog = function(index) {
      var modalInstance = $modal.open({
        size: 'md',
        templateUrl: 'app/ideas/ideas-detail-dialog.html',
        controller: 'IdeasDetailController',
        resolve: {
          ideaId: function(){ return $scope.ideas[index].id; },
          domain: function () { return $scope.formSearch.criteria.domain; },
          username:  function () { return $scope.formSearch.criteria.username; },
          password:  function () { return $scope.formSearch.criteria.password; },
          clientId:  function () { return $scope.formSearch.criteria.clientId; },
        }
      });
    }

    $scope.onDomainKeyUp = function (event) {
      if ($scope.currentDomain && $scope.currentDomain !== $scope.formSearch.criteria.domain) {
        $scope.ideas = [];
        $alert.info('Domain has been changed, please reload idea list', $rootScope);
      }
    }


    // init footable plugin
    angular.element(document).ready(function() {
      $('.footable').footable();
    });

  }
]);