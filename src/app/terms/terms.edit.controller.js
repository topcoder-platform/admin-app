'use strict';

var module = angular.module('supportAdminApp');

/**
 * Controller for edit terms of use view
 */
module.controller('terms.EditTermsController', ['$scope', '$rootScope', 'AGREEABILITY_TYPES', 'AGREE_FOR_DOCUSIGN_TEMPLATE', '$log',
  'TermsService', 'Alert', '$state', '$stateParams',
    function ($scope, $rootScope, agreeabilityTypeList, docusignTypeId, $log, TermsService, $alert, $state, $stateParams) {
      // init variables
      $scope.processing = false;
      $scope.editTerms = { };
      $scope.agreeabilityTypes = agreeabilityTypeList;
      $scope.isDocuSignFieldEnabled = false;
      
      // enable/disable the docu sign template id field
      $scope.agreeabilityTypeChange = function(agreeabilityTypeId) {
        $scope.isDocuSignFieldEnabled = docusignTypeId == agreeabilityTypeId;
        if(!$scope.isDocuSignFieldEnabled) {
          $scope.editTerms.docusignTemplateId = '';
        }
      }

      // clear the alert
      $alert.clear();

      // fetch initial data
      if ($stateParams.termsId) {
        TermsService.findTermsById($stateParams.termsId).then(function (data) {
          $scope.editTerms = data;
          $scope.isDocuSignFieldEnabled = docusignTypeId == $scope.editTerms.agreeabilityTypeId;
        }).catch(function (error) {
          $alert.error(error.error, $rootScope);
        });
      }

      // save the terms of use changes
      $scope.saveTermsOfUse = function () {
        $scope.processing = true;
        var entity = Object.assign({ }, $scope.editTerms);

        Object.keys(entity).forEach(function (key) {
          if (entity[key] == null || entity[key] === '') {
            delete entity[key];
          }
        });

        // delete the id
        delete entity.id;

        // delete the agreeabilityType desc only id is needed
        if(entity.agreeabilityType) {
          delete entity.agreeabilityType;
        }
        
        TermsService.editTerms($scope.editTerms.id, entity).then(function () {
          $scope.processing = false;
          $state.go('index.terms.list');
        }).catch(function (error) {
          $alert.error(error.error, $rootScope);
          $scope.processing = false;
        });
      };
    }
]);