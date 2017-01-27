var topicsListModule = angular.module('topicsList', ["backendUtils"]);

topicsListModule.factory('templates', function() {
  return {
    compact: 'src/kafka-topics/list/compact-topics-list.html',
    system:  'src/kafka-topics/list/system-topics-list.html',
    normal:  'src/kafka-topics/list/normal-topics-list.html'
  };
});

topicsListModule.directive('topicsList', function(templates) {
  return {
    restrict: 'E',
    templateUrl: function($elem, $attr){
      return templates[$attr.mode];
    },
    controller: 'KafkaTopicsListCtrl'
  };
});

topicsListModule.controller('KafkaTopicsListCtrl', function ($scope, $rootScope, $location, toastFactory, env, KafkaBackendFactory) {

  toastFactory.hideToast();

  $rootScope.$watch(
    function () { return $rootScope.cluster; },
    function () { if(typeof $rootScope.cluster == 'object'){  getLeftListTopics(); } },
   true);

  $scope.shortenControlCenterName = function (topic) {
    return shortenControlCenterName(topic);
  }

  $scope.listClick = function (topicName, isControlTopic) {
    var urlType = (isControlTopic == true) ? 'c' : 'n'
    $location.path("cluster/" + env.getSelectedCluster().NAME + "/topic/" + urlType + "/" + topicName, false);
  }

  function getLeftListTopics() {
    KafkaBackendFactory.getListInfo().then(function (allData){
        $scope.topics = allData;
        $scope.controlTopics = $scope.topics.filter(isControlTopic);
        $scope.normalTopics = $scope.topics.filter(isNormalTopic);
        console.log("AAA", $scope.normalTopics);
    });

    //internal for the filters
    function isControlTopic(value) { return value.isControlTopic;  }
    function isNormalTopic(value) { return !isControlTopic(value); }
  }

  //TODO move to utils
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