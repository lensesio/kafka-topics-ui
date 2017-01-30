/**

 This module gives a list of topics with some metadata.

 Example of usage:
     <topics-list mode="normal" cluster="{{cluster}}"></topics-list>

     mode can be `normal`, `system` or `compact`
     cluster is a scope var in module's controller and expects the selected cluster to pick up topics from.

**/
var topicsListModule = angular.module('topicsList', ["HttpFactory"]);

topicsListModule.directive('topicsList', function(templates) {
  return {
    restrict: 'E',
    templateUrl: function($elem, $attr){
      return templates[$attr.mode];
    },
    controller: 'KafkaTopicsListCtrl'
  };
});

topicsListModule.factory('templates', function() {
  return {
    compact: 'src/kafka-topics/list/compact-topics-list.html',
    system:  'src/kafka-topics/list/system-topics-list.html',
    normal:  'src/kafka-topics/list/normal-topics-list.html'
  };
});

topicsListModule.factory('SummariesBackendFactory', function (HttpFactory) {
    return {
        getListInfo: function (endpoint) {
           return HttpFactory.req('GET', endpoint + '/topics/summaries');
        }
    }
});

topicsListModule.controller('KafkaTopicsListCtrl', function ($scope, $location, SummariesBackendFactory) {

  $scope.$watch(
    function () { return $scope.cluster; },
    function () { if(typeof $scope.cluster == 'object'){  getLeftListTopics(); } },
   true);

  $scope.shortenControlCenterName = function (topic) {
    return shortenControlCenterName(topic);
  }

  $scope.listClick = function (topicName, isControlTopic) {
    var urlType = (isControlTopic == true) ? 'c' : 'n';
    $location.path("cluster/" + $scope.cluster.NAME + "/topic/" + urlType + "/" + topicName, false);
  }

  function getLeftListTopics() {
    SummariesBackendFactory.getListInfo($scope.cluster.KAFKA_BACKEND.trim()).then(function (allData){
        $scope.topics = allData;
        $scope.controlTopics = $scope.topics.filter(isControlTopic);
        $scope.normalTopics = $scope.topics.filter(isNormalTopic);
    }); // TODO error message?

    //internal for the filters
    function isControlTopic(value) { return value.isControlTopic;  }
    function isNormalTopic(value) { return !isControlTopic(value); }
  }

  //TODO
  function shortenControlCenterName(topic) {
      if (topic.isControlTopic) {
        return topic.topicName
          .replace('_confluent-controlcenter-0-', '...')
          // .replace('aggregate-topic-partition', 'aggregate-topic')
          .replace('MonitoringMessageAggregatorWindows', 'monitor-msg')
          .replace('aggregatedTopicPartitionTableWindows', 'aggregate-window')
          .replace('monitoring-aggregate-rekey', 'monitor-rekey')
          .replace('MonitoringStream', 'monitor-stream')
          .replace('MonitoringVerifierStore', 'monitor-verifier')
          .replace('...Group', '...group')
          .replace('FIFTEEN_SECONDS', '15sec')
          .replace('ONE_HOUR', '1hour')
          .replace('ONE_WEEK', '1week');
      } else {
        return topic.topicName;
      }
  }

});