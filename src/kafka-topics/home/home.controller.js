angularAPP.controller('HomeCtrl', function ($scope, $rootScope, env) {
  $rootScope.showList = true;

  $scope.$on('$routeChangeSuccess', function() {
    $scope.kafkaRest = env.getSelectedCluster().KAFKA_REST;
  });

});