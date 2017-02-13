
var totalTopicsModule = angular.module('totalTopics', ["HttpFactory"]);

totalTopicsModule.directive('totalTopics', function(templates) {
  return {
    restrict: 'E',
    templateUrl: 'src/kafka-topics/dashboard-components/total-topics/total-topics.html',
    controller: 'TotalTopicsCtrl'
  };
});

totalTopicsModule.factory('SummariesBackendFactory', function (HttpFactory) {
    return {
        getListInfo: function (endpoint) {
           return HttpFactory.req('GET', endpoint + '/topics/summaries');
        }
    }
});

totalTopicsModule.controller('TotalTopicsCtrl', function ($scope, SummariesBackendFactory, env) {
    SummariesBackendFactory.getListInfo(env.KAFKA_BACKEND()).then(function(data) {
      $scope.totalTopics = data.length
    })
});