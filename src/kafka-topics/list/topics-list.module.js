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

topicsListModule.factory('TopicsListFactory', function (HttpFactory) {
    return {
        getTopics: function (endpoint) {
           return HttpFactory.req('GET', endpoint + '/topics');
        },
        getTopicDetails: function(topicName, endpoint){
           return HttpFactory.req('GET', endpoint + '/topics' + '/' + topicName )
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

topicsListModule.factory('shortList', function (HttpFactory) {
  return {
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
})

topicsListModule.controller('KafkaTopicsListCtrl', function ($scope, $location, $rootScope, $cookies, $filter, $log, $q, $http, TopicsListFactory, shortList) {
  $rootScope.showList = true;

  $scope.$watch(
    function () { return $scope.cluster; },
    function () { if(typeof $scope.cluster == 'object'){  getLeftListTopics(); } },
   true);

  $scope.shortenControlCenterName = function (topic) {
    return shortenControlCenterName(topic);
  }

  $scope.query = { order: '-totalMessages', limit: 100, page: 1 };

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
    $location.path("cluster/" + $scope.cluster.NAME + "/topic/" + urlType + "/" + topicName, true);
  }
  function getLeftListTopics() {
    TopicsListFactory.getTopics($scope.cluster.KAFKA_REST.trim()).then(function (allData){
        var topics = [];
        angular.forEach(allData.data, function(topic) {
            TopicsListFactory.getTopicDetails(topic, $scope.cluster.KAFKA_REST.trim()).then(function(res){
                var configsCounter = 0;
                angular.forEach(res.data.configs, function(value, key) { configsCounter++;});
                var topicImproved = {
                    topicName : res.data.name,
                    partitions : res.data.partitions.length,
                    replication : res.data.partitions[0].replicas.length,
                    customConfig : configsCounter,
                    isControlTopic : checkIsControlTopic(res.data.name)
                }

                topics.push(topicImproved);
            })
        })

        $scope.selectedTopics = topics;
        $scope.topics = topics;
        //$scope.selectTopicList(true);

    }).then(function(topics){
        angular.forEach($scope.topics, function(topic) {
            //TODO Fetch Type Avro, Binary, Json
            //When do that, what happens with selectedTopics? They are not going to be updated ?
//            console.log(topic);

        })
    }); // TODO error message?
  }

  function sortTopics(type) {
      var reverse = 1;
      if (type.indexOf('-') == 0) {
        // remove the - symbol
        type = type.substring(1, type.length);
        reverse = -1;
      }
      $scope.selectedTopics = shortList.sortByKey($scope.selectedTopics, type, reverse);
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
      if(!$cookies.getAll().uuid) {
        var DATE = $filter('date')(Date.now(), "yyyy-MM-dd-hh-mm-ss");
        $cookies.put('uuid', DATE);
        var uuid = $cookies.getAll().uuid
        //loadSchemas(uuid)

      } else {
        var uuid=$cookies.getAll().uuid
        console.log('uuid: ', uuid)
       // loadSchemas(uuid)

      }


    //News
    function loadSchemas (uuid) {
      var start = new Date().getTime();

      createConsumers(uuid);

//          schemasPromise.then(function (allSchemas) {
//             var end = new Date().getTime();
////            $rootScope.schemas = allSchemas;
//             $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allSchemas).length + " schemas from topic _schemas"); //  + JSON.stringify(allSchemas)
//             schemas = allSchemas
//             return schemas;
//          }, function (reason) {
//            $log.error('Failed: ' + reason);
//          }, function (update) {
//            $log.info('Got notification: ' + update);
//          });
    }



  //TODO
    function checkIsControlTopic(topicName) {
      var isControlTopic = false;
      angular.forEach(TOPIC_CONFIG.CONTROL_TOPICS, function (controlTopicPrefix) {
        if (topicName.startsWith(controlTopicPrefix, 0))
          isControlTopic = true;
      });
      return isControlTopic;
    }

    var TOPIC_CONFIG = {
    //  KAFKA_TOPIC_DELETE_COMMAND : "kafka-topics --zookeeper zookeeper-host:2181/confluent --delete --topic",
      // Pre-configure the Data Type on particular well-known topics
      JSON_TOPICS: ["_schemas"],
      BINARY_TOPICS: ["connect-configs", "connect-offsets", "__consumer_offsets", "_confluent-monitoring", "_confluent-controlcenter", "__confluent.support.metr"],
      // If a topic starts with this particular prefix - it's a control topic
      CONTROL_TOPICS: ["_confluent-controlcenter", "_confluent-command", "_confluent-metrics", "connect-configs", "connect-offsets", "__confluent", "__consumer_offsets", "_confluent-monitoring", "connect-status", "_schemas"]
      };


});