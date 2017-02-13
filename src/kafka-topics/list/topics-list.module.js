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
    home:  'src/kafka-topics/list/topics-list.html'
  };
});

topicsListModule.factory('SummariesBackendFactory', function (HttpFactory) {
    return {
        getListInfo: function (endpoint) {
           return HttpFactory.req('GET', endpoint + '/topics/summaries');
        },
        sortByKey: function (array, key, reverse) {
          return sortByKey(array, key, reverse);
        }
    }
    function sortByKey(array, key, reverse) {
        return array.sort(function (a, b) {
          var x = a[key];
          var y = b[key];
          return ((x < y) ? -1 * reverse : ((x > y) ? 1 * reverse : 0));
        });
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

  $scope.query = { order: 'totalMessages', limit: 100, page: 1 };

  // This one is called each time - the user clicks on an md-table header (applies sorting)
  $scope.logOrder = function (a) {
      sortTopics(a);
  };

  $scope.totalMessages = function (topic) {
    if(topic.totalMessages == 0) return '0';
    var sizes = ['', 'K', 'M', 'B', 'T', 'Quan', 'Quin'];
    var i = +Math.floor(Math.log(topic.totalMessages) / Math.log(1000));
    return (topic.totalMessages / Math.pow(1000, i)).toFixed(i ? 1 : 0) + sizes[i];
  }

  $scope.selectTopicList = function (displayingControlTopics) {
    $scope.selectedTopics = $scope.topics.filter(function(el) {return el.isControlTopic == displayingControlTopics})
  }

  $scope.listClick = function (topicName, isControlTopic) {
    var urlType = (isControlTopic == true) ? 'c' : 'n';
    $location.path("cluster/" + $scope.cluster.NAME + "/topic/" + urlType + "/" + topicName, false);
  }

  $scope.allCols = [
     {id: "topicName", label: "Topic name", selected: true},
     {id: "totalMessages", label: "Total messages",selected: true},
     {id: "replication", label: "Replication", selected: false},
     {id: "partitions", label: "Partitions", selected: false},
     {id: "unreplicatedPartitions", label: "Unreplicated partitions", selected: false},
     {id: "retention", label: "Retention", selected: false},
     {id: "brokersForTopic", label: "Brokers for topic", selected: false},
     {id: "consumerGroups", label: "Consumer groups", selected: false},
     {id: "keyType", label: "Key type", selected: true},
     {id: "valueType", label: "Value type", selected: true},
     {id: "customConfigs", label: "Custom configs", selected: true}];

  $scope.selectedCols = {};

  $scope.checkAndHide = function checkAndHide(name) {
    if ($scope.selectedCols.searchText){
        var showCol = $scope.selectedCols.searchText.some(function (selectedCols) {
          return selectedCols === name;
        });
        return showCol
    }
  }

  function getLeftListTopics() {
    SummariesBackendFactory.getListInfo($scope.cluster.KAFKA_BACKEND.trim()).then(function (allData){
        $scope.topics = allData;
        $scope.selectedTopics = $scope.topics.filter(function(el) {return el.isControlTopic == false});
    }); // TODO error message?
  }

  function sortTopics(type) {
      var reverse = 1;
      if (type.indexOf('-') == 0) {
        // remove the - symbol
        type = type.substring(1, type.length);
        reverse = -1;
      }
       console.log(type + " " + reverse);
      $scope.selectedTopics = SummariesBackendFactory.sortByKey($scope.selectedTopics, type, reverse);
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