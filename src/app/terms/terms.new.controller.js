'use strict';

var module = angular.module('supportAdminApp');

module.controller('terms.NewTermsController', ['$rootScope', '$scope', 'TermsService', 'Alert',
  'AGREEABILITY_TYPES', 'AGREE_FOR_DOCUSIGN_TEMPLATE', 'AGREE_ELECTRONICALLY', '$state', 'DEFAULT_TERMS_TYPE_ID',
  function ($rootScope, $scope, TermsService, $alert, agreeabilityTypeList, docusignTypeId, electronicallyAgreeableId, $state, defaultTermTypeId) {
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
      response.filter(function (x) {
        if (x.id == defaultTermTypeId) {
          $scope.newTerms.typeId = x.id;
        }
      });
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

    // enable or desable the editor
    $scope.showEditor = false;
    $scope.toggleEditor = function() {
      $scope.showEditor = !$scope.showEditor
    }

    // configs of the wysiwyg editor
    $scope.tinyMceSettings = {
      skin_url: '/node_modules/tinymce/skins/lightgray',
      statusbar: false,
      menubar: false,
      browser_spellcheck: true,
      source_view: true,
      height: 400,
      toolbar: ['undo redo | formatselect | bold italic underline strikethrough | forecolor backcolor | link | alignleft aligncenter alignright alignjustify | numlist bullist outdent indent | table | removeformat'],
      plugins: ['table link textcolor contextmenu'],
    };

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
