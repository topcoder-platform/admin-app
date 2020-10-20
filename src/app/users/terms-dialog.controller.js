module.controller('users.TermsDialogController', [
  '$scope', '$uibModalInstance', 'Alert', 'user', 'TermsService',
  function ($scope, $modalInstance, $alert, user, TermsService) {

    // currently selected user object
    $scope.user = user;

    // true if list is being loaded
    $scope.isLoading = false;
    $scope.isSigning = false;
    $scope.isLoadingNotAdded = false;

    // true if are removing a role
    $scope.isRemoving = false;

    // true if we are adding a role
    $scope.isAdding = false;

    $scope.added = {};
    $scope.added.pageNumber = 1;
    $scope.added.data = [];
    $scope.added.title = '';

    $scope.notAdded = {};
    $scope.notAdded.pageNumber = 1;
    $scope.notAdded.data = [];
    $scope.added.totalCount = 0;
    $scope.notAdded.totalCount = 0;
    $scope.notAdded.title = '';

    /**
     * fetch the added data.
     */
    $scope.fetch = function () {
      $scope.isLoading = true;
      var filter = '';
      filter = 'userId=' + $scope.user.id;
      filter += "&page=" + $scope.added.pageNumber;
      filter += "&perPage=" + 10;

      if ($scope.added.title && $scope.added.title.trim()) {
        filter += "&title=" + $scope.added.title;
      }

      TermsService.getTermByUserIdFilter(filter).then(function (data) {
        $scope.added.data = data.result;
        $scope.added.totalCount = data.totalCount;
      }).catch(function (error) {
        $alert.error(error.error, $scope);
      }).finally(function () {
        $scope.isLoading = false;
      });
    };

    /**
     * fetch not added data.
     */
    $scope.fetchNotAddedData = function () {
      $scope.isLoadingNotAdded = true;
      var filter = '';
      filter += "page=" + $scope.notAdded.pageNumber;
      filter += "&perPage=" + 10;

      if ($scope.notAdded.title && $scope.notAdded.title.trim()) {
        filter += "&title=" + $scope.notAdded.title;
      }
      $scope.notAdded.data = [];
      TermsService.getAllTerms(filter).then(function (data) {
        $scope.notAdded.data = data.result;
        $scope.notAdded.totalCount = data.totalCount;
      }).catch(function (error) {
        $alert.error(error.error, $scope);
      }).finally(function () {
        $scope.isLoadingNotAdded = false;
      });
    };

    $scope.fetch();

    $scope.fetchNotAddedData();

    /**
     * handles move to the last page
     * @param {String} type the data type.
     */
    $scope.getLastPage = function (type) {
      if (type == 'added') {
        return Math.ceil($scope.added.totalCount / 10);
      } else {
        return Math.ceil($scope.notAdded.totalCount / 10);
      }
    };

    /**
     * change to a specific page.
     * @param {number} pageNumber the page number.
     * @param {String} type the data type.
     */
    $scope.changePage = function (pageNumber, type) {
      if (type == 'added') {
        if (pageNumber === 0 || pageNumber > $scope.getLastPage('added') || $scope.added.pageNumber === pageNumber) {
          return false;
        }
        $scope.added.pageNumber = pageNumber;
        $scope.fetch();
      } else {
        if (pageNumber === 0 || pageNumber > $scope.getLastPage('notadded') || $scope.notAdded.pageNumber === pageNumber) {
          return false;
        }
        $scope.notAdded.pageNumber = pageNumber;
        $scope.fetchNotAddedData();
      }
    };

    /**
     * get the number array that shows the pagination bar.
     * @param {String} type the data type.
     */
    $scope.getPageArray = function (type) {
      var res = [];
      if (type == 'added') {
        for (var i = $scope.added.pageNumber - 1; i <= $scope.added.pageNumber; i++) {
          if (i > 0) {
            res.push(i);
          }
        }
        for (var i = $scope.added.pageNumber + 1; i <= $scope.getLastPage('added') && i <= $scope.added.pageNumber + 5; i++) {
          res.push(i);
        }
      } else {
        for (var i = $scope.notAdded.pageNumber - 1; i <= $scope.notAdded.pageNumber; i++) {
          if (i > 0) {
            res.push(i);
          }
        }
        for (var i = $scope.notAdded.pageNumber + 1; i <= $scope.getLastPage('notadded') && i <= $scope.notAdded.pageNumber + 5; i++) {
          res.push(i);
        }
      }

      return res;
    };

    /**
     * handles move to the last page.
     * @param {String} type the data type.
     */
    $scope.getLastPage = function (type) {
      if (type == 'added') {
        return Math.ceil($scope.added.totalCount / 10);
      } else {
        return Math.ceil($scope.notAdded.totalCount / 10);
      }
    };

    /**
     * Close dialog.
     */
    $scope.close = function () {
      $modalInstance.close();
    };

    /**
     * handles the un sign button click.
     * @param {object} item the selected item.
     */
    $scope.unSign = function (item) {
      $scope.isRemoving = true;
      item.isRemoving = true;
      $alert.clear();

      TermsService.removeTermUser(item.id, $scope.user.id).then(function () {
        $alert.success('Term Removed Successfully!', $scope);
        $scope.fetch();
        $scope.fetchNotAddedData();
      }).catch(function (error) {
        $alert.error(error.error, $scope);
      }).finally(function () {
        $scope.isRemoving = false;
        item.isRemoving = false;
      });
    };

    /**
     * handles the un sign button click.
     * @param {object} item the selected item.
     */
    $scope.sign = function (item) {
      $scope.adding = true;
      item.adding = true;
      $scope.isSigning = true;
      $alert.clear();

      TermsService.addUserTerms({ termsOfUseId: item.id, userId: $scope.user.id }).then(function () {
        $alert.success('Term Added Successfully!', $scope);
        $scope.fetch();
        $scope.fetchNotAddedData();
      }).catch(function (error) {
        $alert.error(error.error, $scope);
      }).finally(function () {
        $scope.adding = false;
        item.adding = false;
        $scope.isSigning = false;
      });
    };

    /**
     * handles filter of added terms.
     */
    $scope.filterAddedTerms = function () {
      $scope.added.pageNumber = 1;
      $scope.fetch();
    };

    /**
     * handles filter of not added terms.
     */
    $scope.filterNotAddedTerms = function () {
      $scope.notAdded.pageNumber = 1;
      $scope.fetchNotAddedData();
    };

    /**
     * checks if the row is already added or not.
     * @param {Object} item the row item.
     */
    $scope.isNotAdded = function (item) {
      var matched = false;
      _.each($scope.added.data, function (data) {
        if (data.id === item.id && !matched) {
          matched = true;
        }
      });
      return matched;
    }
  }
]);
