'use strict';

var kafkaZooUIApp = angular.module('kafkaZooUIApp', [
  'ui.ace',
  'angularSpinner',
  'angularUtils.directives.dirPagination',
  'ngRoute',
  'ngMaterial',
  'ngAnimate',
  'ngAria',
  'base64'
])

kafkaZooUIApp.controller('MenuCtrl', function ($scope) {
   $scope.apps = [];
   var thisApp = "Kafka Topics"
   angular.forEach(ENV.APPS, function (app) {
      if (app.enabled && !(app.name == thisApp)) {
         $scope.apps.push(app);
      }
   });

   $scope.disableAppsMenu = true;
   if ($scope.apps.length > 0) {
      $scope.disableAppsMenu = false;
   }
});

kafkaZooUIApp.config(function ($routeProvider, $httpProvider) {
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




