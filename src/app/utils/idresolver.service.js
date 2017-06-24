'use strict';

/**
 * Utility service provides functions to resolve user handles and group names by ids
 *
 * Instead of caching loaded users and groups globally in this service for the whole application lifetime
   we create instances so we can get up to date information about users and groups when we want
 */
angular.module('supportAdminApp')
  .factory('IdResolverService', [
             'UserService', 'GroupService',
    function(UserService, GroupService) {

      var IdResolverService = {};

      /**
       * Creates a function which will load user handle by user id
       * Returned function will load user handles only once for each user
       * and will store already loaded user in scopeStore
       *
       * @param  {Object}   scopeStore object to store loaded users handles
       * @return {Function}            function which can get user handle by its id
       */
      IdResolverService.getUserResolverFunction = function(scopeStore) {
        var loadingUser = false;
        var userLoadQueue = [];

        /**
         * Loads handle of the user specified by id into scopeStore. Does nothing,
         * if the handle is already in there. To avoid overloading API with
         * requests, this function handles the calls sequentially.
         *
         * @param {String} id User ID.
         */
        function loadUser(id) {
          if (id && !scopeStore[id]) {
            if (loadingUser) userLoadQueue.push(id);
            else {
              loadingUser = true;
              UserService.findById(id).then(function(res) {
                scopeStore[id] = res.handle;
              }).catch(function() {
                scopeStore[id] = id + ' (not found)';
              }).finally(function() {
                loadingUser = false;
                while (userLoadQueue.length) {
                  var next = userLoadQueue[0];
                  userLoadQueue = userLoadQueue.slice(1);
                  if (!scopeStore[next]) return loadUser(next);
                }
              });
            }
          }
        }

        /**
         * Clears the queue of user handles to load
         *
         * We define clearQueue function this way because loadUser
         * function is widely used in the project, to avoid changing
         * it everywhere.
         *
         * So in the new places where we need it, we can call loadUser.clearQueue()
         */
        loadUser.clearQueue = function() {
          userLoadQueue = [];
        }

        return loadUser;
      }

      /**
       * Creates a function which will load group name by group id
       * Returned function will load groups names only once for each user
       * and will store already loaded group in scopeStore
       *
       * @param  {Object}   scopeStore object to store loaded group names
       * @return {Function}            function which can get user handle by its id
       */
      IdResolverService.getGroupResolverFunction = function(scopeStore) {
        var loadingGroup = false;
        var groupLoadQueue = [];

        /**
         * Loads name of the group specified by id into scopeStore. Does nothing,
         * if the group is already in there. To avoid overloading API with
         * requests, this function handles the calls sequentially.
         *
         * @param {String} id Group ID.
         */
        function loadGroup(id) {
          if (id && !scopeStore[id]) {
            if (loadingGroup) groupLoadQueue.push(id);
            else {
              loadingGroup = true;
              GroupService.findById(id, ['name']).then(function(res) {
                scopeStore[id] = res.name;
              }).catch(function() {
                scopeStore[id] = id + ' (not found)';
              }).finally(function() {
                loadingGroup = false;
                while (groupLoadQueue.length) {
                  var next = groupLoadQueue[0];
                  groupLoadQueue = groupLoadQueue.slice(1);
                  if (!scopeStore[next]) return loadGroup(next);
                }
              });
            }
          }
        }

        /**
         * Clears the queue of group names to load
         *
         * We define clearQueue function this way because loadUser
         * function is widely used in the project, to avoid changing
         * it everywhere. And for loadGroup we just want to keep it same way.
         *
         * So in the new places where we need it, we can call loadGroup.clearQueue()
         */
        loadGroup.clearQueue = function() {
          groupLoadQueue = [];
        }

        return loadGroup;
      }

      return IdResolverService;
  }]);
