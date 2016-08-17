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

kafkaTopicsUIApp.controller('MenuCtrl', function ($scope, $log) {
  $scope.apps = [];
  angular.forEach(ENV.APPS, function (app) {
    if (app.urlSchema != undefined && app.urlSchema != "") {
      app.url = app.urlSchema;
    } else if (app.urlTopics != undefined && app.urlTopics != "") {
      app.url = app.urlTopics;
    } else if (app.urlConnect != undefined && app.urlConnect != "") {
      app.url = app.urlConnect;
    } else if (app.urlAlerts != undefined && app.urlAlerts != "") {
      app.url = app.urlAlerts;
    } else if (app.urlManager != undefined && app.urlManager != "") {
      app.url = app.urlManager;
    } else if (app.urlMonitoring != undefined && app.urlMonitoring != "") {
      app.url = app.urlMonitoring;
    }
    if (app.url != undefined) {
      $scope.apps.push(app);
      $log.debug("Menu app enabled -> " + app.name);
    }
  });
  $scope.disableAppsMenu = $scope.apps.length <= 0;
});

kafkaTopicsUIApp.config(function ($routeProvider) {
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

kafkaTopicsUIApp.filter("sanitize", ['$sce', function ($sce) {
  return function (htmlCode) {
    return $sce.trustAsHtml(htmlCode);
  }
}]);