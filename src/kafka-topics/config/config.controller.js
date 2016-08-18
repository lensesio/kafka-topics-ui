angularAPP.controller('KafkaTopicsConfigCtrl', function ($scope, $http, $log, KafkaRestProxyFactory) {

  $log.info("Starting kafka-topics controller : config");

  $scope.schemaRegistryURL = UI_SCHEMA_REGISTRY;
  $scope.kafkaRest = KAFKA_REST;
  $scope.brokers = {};
  $scope.connectionFailure = false;

  /**
   * At start up get the Brokers that the kafka-rest server is using
   */
  KafkaRestProxyFactory.getBrokers().then(
    function success(brokers) {
      $scope.brokers = brokers.brokers;
    },
    function failure() {
      $scope.connectionFailure = true;
    });

});
