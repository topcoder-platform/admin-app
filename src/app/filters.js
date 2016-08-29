'use strict';

// Filter to pretty print json
angular.module('supportAdminApp')
  .filter('prettyJSON', function () {
    return function (json) {
      return angular.toJson(json, true);
    };
  })
  .filter('capitalize', function () {
    return function (input) {
      return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
    };
  })
  .filter('tcConnectLink', function () {
    return function (id) {
      return 'https://connect.topcoder.com//projects/' + id + '/timeline';
    };
  })
  
  // The resulting link will point to the public member profile,
  // use 'tcPrivateProfileLink' instead to link to the private profile.
  .filter('tcProfileLink', function () {
    return function (id) {
      if (id && id !== 'unassigned')
        return 'http://www.topcoder.com/tc?module=MemberProfile&cr=' + id;
      return 'javascript:;';
    };
  })

  .filter('tcPrivateProfileLink', function () {
    return function (handle) {
      if (handle)
        return 'http://www.topcoder.com/tc?module=LegacyReport&t=profile&ha=' + handle;
      return 'javascript:;';
    };
  })

  .filter('tcDirectLink', function () {
    return function (id) {
      return 'https://www.topcoder.com/direct/projectOverview?formData.projectId=' + id;
    };
  })
  .filter('fmtDate', function () {
    return function (date, blankOnNull) {      
      if (blankOnNull && !date) {
        return '';
      }

      date = date ? new Date(date) : new Date();
      var yyyy = date.getFullYear();
      var mm = _.padStart(date.getMonth() + 1, 2, '0');
      var dd = _.padStart(date.getDate(), 2, '0');
      var hh = _.padStart(date.getHours(), 2, '0');
      var mi = _.padStart(date.getMinutes(), 2, '0');
      return [yyyy, '-', mm, '-', dd, ' ', hh, ':', mi].join('');
    };
  });
