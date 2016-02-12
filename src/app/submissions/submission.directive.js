'use strict';

var module = angular.module('supportAdminApp');

/**
 * This directive handles file upload 
 */
module.directive('fileModel', ['$parse', function ($parse) {
    // return {
    //     restrict: 'A',
    //     link: function (scope, element, attrs) {
    //         var model = $parse(attrs.fileModel);
    //         var modelSetter = model.assign;

    //         element.bind('change', function (evt) {
    //             /** Code to set name of file in text field */
    //             if (evt.target.files && evt.target.files[0]) {
    //                 var files = evt.target.files;
    //                 var fileName = files[0].name
    //                 console.dir(files[0]);
    //                 scope.$apply(function () {
    //                     $('#' + attrs.id + '-fileName').val(fileName);
    //                     modelSetter(scope, element[0].files[0]);
    //                 });
    //             }
    //         });
    //     }
    return {
        require: "ngModel",
        restrict: 'A',
        link: function ($scope, el, attrs, ngModel) {
            el.bind('change', function (event) {
                ngModel.$setViewValue(event.target.files[0]);
                $scope.$apply();
            });
            
            $scope.$watch(function () {
                return ngModel.$viewValue;
            }, function (value) {
                if (!value) {
                    el.val("");
                }
            });
        }
    };
}]);
