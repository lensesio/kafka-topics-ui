
var totalTopicsModule = angular.module('totalTopics', ["HttpFactory"]);

totalTopicsModule.directive('totalTopics', function(templates) {
  return {
    restrict: 'E',
    templateUrl: 'src/kafka-topics/dashboard-components/total-topics/total-topics.html',
    controller: 'TotalTopicsCtrl'
  };
});

totalTopicsModule.factory('TopicsCountBackendFactory', function (HttpFactory) {
    return {
        getTopics: function (endpoint) {
           return HttpFactory.req('GET', endpoint + '/topics');
        }
    }
});

totalTopicsModule.controller('TotalTopicsCtrl', function ($scope, TopicsCountBackendFactory, env) {
    TopicsCountBackendFactory.getTopics(env.KAFKA_REST()).then(function(data) {
      $scope.totalTopics = data.data.length
    })
});