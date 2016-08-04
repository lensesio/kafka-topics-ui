schemaRegistryUIApp.controller('SchemaRegistryConfigCtrl', function ($scope, $http, $log) {

  $log.debug("Starting schema-registry config controller");
  $scope.schemaRegistryURL = ENV.SCHEMA_REGISTRY;
  $scope.config = {};
  $scope.connectionFailure = false;

  //Get the top level config
  $http.get(ENV.SCHEMA_REGISTRY + '/config/').then(
    function successCallback(response) {
      $scope.config = response.data;
    },
    function errorCallback(response) {
      $log.error("Failure with : " + JSON.stringify(response));
      $scope.connectionFailure = true;
    });
});
