angularAPP.controller('HealthcheckCtrl', function ($scope, $rootScope, $http, $log, env) {

  $rootScope.showList = true;

  var allClusters = env.getAllClusters();

  angular.forEach(allClusters, function(cluster) {
    $http.get(cluster.KAFKA_REST + '/topics').then(function(response) {
        var isOk = (response.status >= 200 && response.status < 400 ) ? true : false;
        cluster.isOk = isOk;
    })
  })
  $scope.allClusters = allClusters;

  //TODO healthcheck + brokers


});
