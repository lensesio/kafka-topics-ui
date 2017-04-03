angularAPP.controller('HomeCtrl', function ($scope, env) {

  $scope.$on('$routeChangeSuccess', function() {
    $scope.kafkaRest = env.getSelectedCluster().KAFKA_REST;
  });

});