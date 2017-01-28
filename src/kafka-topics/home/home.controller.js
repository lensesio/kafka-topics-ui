angularAPP.controller('HomeCtrl', function ($scope, toastFactory, $http, $log, KafkaRestProxyFactory, env) {
  toastFactory.hideToast();

  $scope.$on('$routeChangeSuccess', function() {
    $scope.kafkaRest = env.KAFKA_REST();
    $log.info(env.KAFKA_REST(),"Starting kafka-topics controller : config");
//    $scope.brokers = {};
    $scope.connectionFailure = false;

  });


});