'use strict';

var angularAPP = angular.module('angularAPP', [
  'ngRoute',
  'ngMaterial',
  'ngAnimate',
  'ngCookies',
  'md.data.table',
  'ngAria',
  'ui.ace',
  'angularUtils.directives.dirPagination',
  'angular-json-tree',
  'env',
  'HttpFactory',
  'topicsList',
  'totalBrokers',
  'totalTopics',
  'flatView',
  'treeView',
  'ngHandsontable',
  'rawView',
  'base64'
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
}]);

angularAPP.config(function($logProvider){
  $logProvider.debugEnabled(true); //todo get from env
});

angularAPP.config(function ($routeProvider, $locationProvider) {
$locationProvider.html5Mode();
  $locationProvider.hashPrefix('');
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
    .when('/cluster/:cluster/topic/:topicCategoryUrl/:topicName/:menuItem', {
      templateUrl: 'src/kafka-topics/view/view.html',
      controller: 'ViewTopicCtrl'
    })
    .when('/cluster/:cluster/topic/:topicCategoryUrl/:topicName/:menuItem/:selectedTabIndex', {
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


angularAPP.filter('humanize', function(){
    return function humanize(number) {
        if(number < 1000) {
            return number;
        }
        var si = ['K', 'M', 'G', 'T', 'P', 'H'];
        var exp = Math.floor(Math.log(number) / Math.log(1000));
        var result = number / Math.pow(1000, exp);
        result = (result % 1 > (1 / Math.pow(1000, exp - 1))) ? result.toFixed(2) : result.toFixed(0);
        return result + si[exp - 1];
    };
});
