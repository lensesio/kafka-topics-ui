'use strict';

var kafkaTopicsUIApp = angular.module('kafkaTopicsUIApp', [
  'ui.ace',
  'angularSpinner',
  'angularUtils.directives.dirPagination',
  'ngRoute',
  'ngMaterial',
  'ngAnimate',
  'ngAria',
  'base64',
  'ngOboe'
]);

// ng-show="x | isEmpty"
kafkaTopicsUIApp.filter('isEmpty', function () {
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

kafkaTopicsUIApp.controller('MenuCtrl', function ($scope) {
  $scope.apps = [];
  var thisApp = "Kafka Topics UI";
  angular.forEach(ENV.APPS, function (app) {
    if (app.enabled && !(app.name == thisApp)) {
      $scope.apps.push(app);
    }
  });

  $scope.disableAppsMenu = $scope.apps.length <= 0;
});

kafkaTopicsUIApp.config(function ($routeProvider, $httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];
  $routeProvider
    .when('/', {
      templateUrl: 'src/home/home.html'
    })
    .when('/create-topic', {
      templateUrl: 'src/kafka-topics-new/kafka-topics-new.html',
      controller: 'HeaderCtrl'
    })
    .when('/topic/:topicName', {
      templateUrl: 'src/kafka-topics-detail/kafka-topics-detail.html',
      controller: 'ViewTopicCtrl'
    }).otherwise({
    redirectTo: '/'
  });
});
