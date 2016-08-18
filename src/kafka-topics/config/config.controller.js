angularAPP.controller('KafkaTopicsConfigCtrl', function ($scope, $http, $log) {

  $log.debug("Starting schema-registry config controller");
  $scope.schemaRegistryURL = UI_SCHEMA_REGISTRY;
  $scope.kafkaRest = KAFKA_REST;
  $scope.brokers = {};
  $scope.connectionFailure = false;

  //Get the brokers this kafka-rest server connects to
  $http.get(KAFKA_REST + '/brokers').then(
    function successCallback(response) {
      $scope.brokers = response.data.brokers.length;
      $log.debug("Number of Brokers -> " + response.data.brokers.length);
    },
    function errorCallback(response) {
      $log.error("Failure with : " + JSON.stringify(response));
      $scope.connectionFailure = true;
    });
});
