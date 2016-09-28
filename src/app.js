'use strict';

var angularAPP = angular.module('angularAPP', [
  'ui.ace',
  'angularSpinner',
  'angularUtils.directives.dirPagination',
  'ngRoute',
  'ngMaterial',
  'ngAnimate',
  'md.data.table',
  'ngAria',
  'base64',
  'ngOboe',
  'ui.grid',
  'ui.grid.resizeColumns',
  'angular-json-tree'
]);

angularAPP.controller('HeaderCtrl', function ($rootScope, $scope, $log) {
   $rootScope.showList = true;
   $rootScope.toggleList = function () {
      $rootScope.showList = !$rootScope.showList;
   };

   $rootScope.showLeftList = function () {
      $rootScope.showList = true;
   };


});

angularAPP.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'src/kafka-topics/home/home.html',
      controller: 'HomeCtrl'
    })
    .when('/create-topic', {
      templateUrl: 'src/kafka-topics/new/new-topic.html',
      controller: 'HeaderCtrl'
    })
    .when('/topic/:topicName', {
      templateUrl: 'src/kafka-topics/view/view.html',
      controller: 'ViewTopicCtrl'
    }).otherwise({
    redirectTo: '/'
  });
  // $locationProvider.html5Mode(true);
});

// ng-show="x | isEmpty"
angularAPP.filter('isEmpty', function () {
  var bar;
  return function (obj) {
    for (bar in obj) {
      if (obj.hasOwnProperty(bar)) {
        return false;
      }
    }
    return true;
  };
});

angularAPP.filter("sanitize", ['$sce', function ($sce) {
  return function (htmlCode) {
    return $sce.trustAsHtml(htmlCode);
  }
}]);

angularAPP.config(function ($mdThemingProvider) {
  $mdThemingProvider.theme('default')
    .primaryPalette('blue-grey')
    .accentPalette('blue')
    .warnPalette('grey');
});
