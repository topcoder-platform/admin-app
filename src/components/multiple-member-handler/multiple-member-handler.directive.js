(function() {
    'use strict'


    angular.module('supportAdminApp').directive('multipleMemberHandler', ['UserService', multipleMemberHandler])

    function multipleMemberHandler(UserService) {
      return {
        restrict: 'AE',
        replace: true,
        scope: {
            handles: '=',
        },
        templateUrl: 'components/multiple-member-handler/multiple-member-handler.directive.html',
        link: function(scope, element, attr) {
            scope.handlesSearch = []
            scope.handle = null;

            /**
             * handles the input when pasting a series of handles separated by spaces, commas, line-breaks, tabs or semicolons
             */
            scope.handleMultipleHandles = function() {
                if (scope.handle) {
                    var handles = scope.handle.split(/[ ,\n\t;]+/).map(function(handle) {
                        return handle.trim();
                    });
                    if (handles.length > 1) {
                        UserService.getMembersByHandle(handles).then(function(resp) {
                            handles.forEach(function(handle) {
                                var handleFound = resp.filter(function(user) {
                                return handle.toLowerCase() == user.handle.toLowerCase();
                                });
                                if (handleFound.length)
                                    addHandle(handleFound[0].handle);
                                else
                                    addHandle(handle);
                            })
                            resp.forEach(function(user) {
                                scope.handles.push(user.handle);
                            });
                            scope.handle = null;
                        })
                    }
                }
            }

            /**
             * checks if the handle has been found in the backend
             * @param {string} handle
             */
            scope.hasFoundHandle = function(handle) {
                return scope.handles.filter(function(handleFound) {
                    return handleFound.toLowerCase() === handle.toLowerCase();
                }).length > 0;
            }

            /**
             * handles removing a tag containing a handle previously selected
             * @param {string} handle
             */
            scope.removeHandle = function(handle) {
                scope.handlesSearch = scope.handlesSearch.filter(function(handleFound) {
                    return !(handleFound === handle);
                });
                scope.handles = scope.handles.filter(function(handleFound) {
                    return !(handleFound === handle);
                });
            }

            /**
             * adds a handle tag to the frontend, wether it has been found in the backend or not
             * @param {string} handleTag
             */
            function addHandle(handleTag) {
                if (scope.handlesSearch.filter(function(handle) {
                    return handle == handleTag;
                }).length == 0) {
                    scope.handlesSearch.push(handleTag);
                    return true;
                }
                return false;
            }

            /**
             * used by typeahead when using autocomplete when adding a single user
             */
            scope.selectHandle = function() {
                addHandle(scope.handle)
                var hasPreviouslyFoundHandle = (
                    scope.handles.filter(function(handleFound) {
                        return handleFound === scope.handle;
                    }).length > 0);
                if (!hasPreviouslyFoundHandle)
                  scope.handles.push(scope.handle);
                scope.handle = null;
            }

            /**
             * searches the handle.
             * @param {string} filter the filter.
             */
            scope.searchHandle = function (filter) {
                scope.isLoading = true;
                if (filter.split(/[ ,\n\t;]+/).length == 1)
                    return UserService.getMemberSuggestByHandle(filter).then(function (data) {
                        scope.isLoading = false;
                        return _.map(data, function (x) { return x.handle });
                    })
            };

            /**
             * deletes a previously selected user (tag) when the user presses backspace with an empty input in focus
             * @param {object} event
             */
            scope.checkEmptyAndDeleteTag = function(event) {
                if (event.keyCode === 8) {
                    if (!event.target.value) {
                        scope.removeHandle(scope.handlesSearch[scope.handlesSearch.length - 1]);
                    }
                }
            }
        }
      }
    }
  })(); // add ";" to avoid issues after building into one file
