
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
        getBrokers: function () {
           return HttpFactory.req('GET',"https://kafka-rest-proxy.demo.landoop.com" + '/brokers');
        }
    }
});

totalBrokersModule.controller('TotalBrokersCtrl', function ($scope,  $log, BrokersBackendFactory) {
    BrokersBackendFactory.getBrokers().then(
      function success(brokers) {
        $scope.totalBrokers = brokers.brokers.length;
      },
      function failure() {
        $scope.connectionFailure = true;
    });

});