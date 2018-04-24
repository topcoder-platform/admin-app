'use strict';

var module = angular.module('supportAdminApp');

module.controller('IdeasDetailController', ['$scope',  '$log','IdeaService', 'Alert', '$timeout', 'OAuth2Service','$uibModalInstance', 'ideaId', 'domain', 'username', 'password', 'clientId', 'clientSecret', '$sce', 'SPIGIT_API_URL',
  function ($scope, $log, IdeaService, $alert, $timeout, OAuth2Service, $modalInstance, ideaId, domain, username, password, clientId, clientSecret, $sce, SPIGIT_API_URL) {

  $scope.ideaId = ideaId;
  $scope.domain = domain;
  $scope.username = username;
  $scope.password = password;
  $scope.clientId = clientId;
  $scope.clientSecret = clientSecret;

  $scope.form = {};
  $scope.isLoading = false;

  $scope.load = function() {

    $scope.isLoading = true;

    // If token expired should get new token first
    if (OAuth2Service.checkTokenExpireTime()) {
      OAuth2Service.refreshToken($scope.username, $scope.password, $scope.domain, $scope.clientId, $scope.clientSecret).then(function (data) {
         $scope.loadDetail();
      }).catch(function (error) {
        $alert.error(error.message, $scope);
        $scope.isLoading = false;
      });
    } else {
      $scope.loadDetail();
    }
  }

  // get idea detail
  $scope.loadDetail = function() {
    IdeaService.getIdeaDetail(domain, $scope.ideaId).then(function (data) {
      $scope.form.title = data.title;
      $scope.form.content = $sce.trustAsHtml($scope.convertContent(data.content));
      // get creator detail
      IdeaService.getUserDetail(domain, data.creator_id).then(function(user) {
        $scope.form.firstName = user.first_name;
        $scope.form.lastName = user.last_name;
        $scope.form.email = user.primary_email;
        $scope.isLoading = false;
      });
    }).catch(function (error) {
      $alert.error(error.error, $scope);
      $scope.isLoading = false;
    });
  }

    /**
     * Convert detail content without html tags
     * @param content
     * @returns {string}
     */
   $scope.convertContent = function(content) {
     var newContent= content.replace(/<img [^>]*src=['"]([^'"]+)[^>]*>/gi,function(match,capture){
       var newStr='<img src="http://' + domain + "." + SPIGIT_API_URL +capture+'" />';
       return newStr;
     });
     return newContent;
   }

    $scope.cancel = function() {
      $modalInstance.close();
    };


   $scope.load();
  }
]);