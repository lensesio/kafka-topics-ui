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
  'angular-json-tree',
  'topicsList',
  'totalBrokers',
  'totalTopics',
  'env'
]);

//angularAPP.controller('HeaderCtrl', function (env, $rootScope, $scope, $log, $location, $route) { });

angularAPP.run(
    function loadRoute( env, $routeParams, $rootScope, $location, $http ) {
        $rootScope.$on('$routeChangeSuccess', function() {
            //When the app starts set the envs
            if(!env.isMissingEnvJS()) {
                 env.setSelectedCluster($routeParams.cluster);
                 $rootScope.clusters = env.getAllClusters();
                 $rootScope.cluster = env.getSelectedCluster();
            } else {
                 $rootScope.missingEnvJS = env.isMissingEnvJS();
            }
       });

       $rootScope.selectCluster = function(cluster) {
           $rootScope.connectionFailure = false;
           $location.path("/cluster/"+cluster)
           $rootScope.cluster = cluster;
       }

       //TODO Where to check connectivity and make it public for all components ?
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
    .when('/healthcheck', {
      templateUrl: 'src/kafka-topics/healthcheck/healthcheck.html',
      controller: 'HealthcheckCtrl'
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
