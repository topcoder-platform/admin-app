'use strict';

var module = angular.module('supportAdminApp');

module.controller('terms.NewTermsController', ['$rootScope', '$scope', 'TermsService', 'Alert',
  'AGREEABILITY_TYPES', 'AGREE_FOR_DOCUSIGN_TEMPLATE', 'AGREE_ELECTRONICALLY', '$state',
  function ($rootScope, $scope, TermsService, $alert, agreeabilityTypeList, docusignTypeId, electronicallyAgreeableId, $state) {
    // init variables
    $scope.newTerms = {};
    $scope.processing = false;
    $scope.agreeabilityTypes = agreeabilityTypeList;
    $scope.isDocuSignFieldEnabled = false;
    $scope.isUrlEnabled = false;
    $scope.termTypes = [];

    // clear the alert
    $alert.clear();

    // get term types
    TermsService.getTypes().then(function (response) {
      $scope.termTypes = response;
    }).catch(function (error) {
      $alert.error(error.error, $rootScope);
    });

    // enable/disable the docu sign template id field
    $scope.agreeabilityTypeChange = function (term) {
      $scope.isDocuSignFieldEnabled = docusignTypeId == term.agreeabilityTypeId;
      $scope.isUrlEnabled = electronicallyAgreeableId == term.agreeabilityTypeId;
      if (!$scope.isDocuSignFieldEnabled) {
        $scope.newTerms.docusignTemplateId = '';
      }
    }

    // create new terms of use
    $scope.createTermsOfUse = function () {
      // clear the alert
      $alert.clear();
      $scope.processing = true;
      var entity = Object.assign({}, $scope.newTerms);

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
