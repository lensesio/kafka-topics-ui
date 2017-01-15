angularAPP.controller('HealthcheckCtrl', function ($scope,$rootScope, $http, $log, KafkaRestProxyFactory, env) {

  $rootScope.showList = false;

//$scope.$on('$routeChangeSuccess', function() {
//  $scope.kafkaRest = env.KAFKA_REST();
//  $log.info(env.KAFKA_REST(),"Starting kafka-topics controller : config");
//  $scope.brokers = {};
//  $scope.connectionFailure = false;
//
//  /**
//  * At start up get the Brokers that the kafka-rest server is using
//  */
//  KafkaRestProxyFactory.getBrokers().then(
//    function success(brokers) {
//      $scope.brokers = brokers.brokers;
//    },
//    function failure() {
//      $scope.connectionFailure = true;
//  });
//});


});
