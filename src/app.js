'use strict';

//TODO CLEAN UP
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

angularAPP.controller('HeaderCtrl', function (env, $rootScope, $scope, $log, $location, $route) {

  $scope.$on('$routeChangeSuccess', function() {
     $rootScope.clusters = env.getClusters();
     $rootScope.cluster = env.getSelectedCluster();
     $scope.color = $scope.cluster.COLOR;
  });

  $scope.updateEndPoint = function(cluster) {
    $rootScope.connectionFailure = false;
    $location.path("/cluster/"+cluster)
    $rootScope.cluster = cluster;
  }

   $rootScope.showList = true;
   $rootScope.toggleList = function () {
      $rootScope.showList = !$rootScope.showList;
   };

   $rootScope.showLeftList = function () {
      $rootScope.showList = true;
   };


});

angularAPP.run(
    function loadRoute( env, $routeParams, $rootScope ) {
        $rootScope.$on('$routeChangeSuccess', function() {
          env.setSelectedCluster($routeParams.cluster);
       });
    }
)

angularAPP.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}])

angularAPP.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'src/kafka-topics/home/home.html',
      controller: 'HomeCtrl'
    })
    .when('/cluster/:cluster', {
      templateUrl: 'src/kafka-topics/home/home.html',
       controller: 'HomeCtrl'
    })
    .when('/cluster/:cluster/create-topic', {
      templateUrl: 'src/kafka-topics/new/new-topic.html',
      controller: 'HeaderCtrl'
    })
    .when('/cluster/:cluster/topic/:topicCategoryUrl/:topicName/', {
        templateUrl: 'src/kafka-topics/view/view.html',
        controller: 'ViewTopicCtrl'
      })
    .when('/cluster/:cluster/topic/:topicCategoryUrl/:topicName/:selectedTabIndex', {
      templateUrl: 'src/kafka-topics/view/view.html',
      controller: 'ViewTopicCtrl'
    }).otherwise({
    redirectTo: '/'
  });
  // $locationProvider.html5Mode(true);
});

angularAPP.run(['$route', '$rootScope', '$location', function ($route, $rootScope, $location) {
    var original = $location.path;
    $location.path = function (path, reload) {
        if (reload === false) {
            var lastRoute = $route.current;
            var un = $rootScope.$on('$locationChangeSuccess', function () {
                $route.current = lastRoute;
                un();
            });
        }
        return original.apply($location, [path]);
    };
}])

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
