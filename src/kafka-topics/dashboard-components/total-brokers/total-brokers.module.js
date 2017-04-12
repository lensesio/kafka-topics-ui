
var totalBrokersModule = angular.module('totalBrokers', ["HttpFactory"]);

totalBrokersModule.directive('totalBrokers', function(templates) {
  return {
    restrict: 'E',
    templateUrl: 'src/kafka-topics/dashboard-components/total-brokers/total-brokers.html',
    controller: 'TotalBrokersCtrl'
  };
});

totalBrokersModule.factory('BrokersBackendFactory', function (HttpFactory) {
    return {
        getBrokers: function (endpoint) {
           return HttpFactory.req('GET', endpoint + '/brokers');
        }
    }
});

totalBrokersModule.controller('TotalBrokersCtrl', function ($scope,  $log, BrokersBackendFactory, env) {
var endpoint = env.KAFKA_REST().trim()
    BrokersBackendFactory.getBrokers(endpoint).then(
      function success(brokers) {
       $scope.totalBrokers = brokers.data.brokers.length;
      },
      function failure() {
        $scope.connectionFailure = true;
    });

});