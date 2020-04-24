'use strict';

var module = angular.module('supportAdminApp');

module.controller('terms.NewTermsController', ['$rootScope','$scope', 'TermsService', 'Alert',
'AGREEABILITY_TYPES', 'AGREE_FOR_DOCUSIGN_TEMPLATE', '$state',
  function($rootScope, $scope, TermsService, $alert, agreeabilityTypeList, docusignTypeId, $state) {
    // init variables
    $scope.newTerms = {};
    $scope.processing = false;
    $scope.agreeabilityTypes = agreeabilityTypeList;
    $scope.isDocuSignFieldEnabled = false;
    
    // clear the alert
    $alert.clear();

    // enable/disable the docu sign template id field
    $scope.agreeabilityTypeChange = function(agreeabilityTypeId) {
      $scope.isDocuSignFieldEnabled = docusignTypeId == agreeabilityTypeId;
      if(!$scope.isDocuSignFieldEnabled) {
        $scope.newTerms.docusignTemplateId = '';
      }
    }
    
     // create new terms of use
     $scope.createTermsOfUse = function () {
      $scope.processing = true;
      var entity = Object.assign({ }, $scope.newTerms);

      if (entity.docusignTemplateId === '') {
        delete entity.docusignTemplateId;
      }

      TermsService.createTerms(entity).then(function () {
        $scope.processing = false;
        $state.go('index.terms.list');
      }).catch(function (error) {
        $alert.error(error.error, $rootScope);
        $scope.processing = false;
      });
    };
  }
]);
