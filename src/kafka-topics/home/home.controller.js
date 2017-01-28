angularAPP.controller('HomeCtrl', function ($scope, toastFactory, $http, $log, env) {
  toastFactory.hideToast();

  $scope.$on('$routeChangeSuccess', function() {
    $scope.kafkaRest = env.getSelectedCluster().KAFKA_REST;
//    $log.info(env.KAFKA_REST(),"Starting kafka-topics controller : config");
//    $scope.brokers = {};
//    $scope.connectionFailure = false;

  });


});