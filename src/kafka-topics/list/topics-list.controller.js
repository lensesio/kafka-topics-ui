kafkaTopicsUIApp.controller('KafkaTopicsListCtrl', function ($scope, $rootScope, $routeParams, $mdToast, $log, kafkaZooFactory, toastFactory) {

  $log.debug("KafkaTopicsListCtrl - initializing - getting existing topics");
  toastFactory.hideToast();

  // 1. Get topics
  var topicsPromise = kafkaZooFactory.getTopicList();
  topicsPromise.then(function (result) {
    var normalTopics = result.normal;
    var controlTopics = result.control;

    if (normalTopics.toString().indexOf("Error in getting topics from kafka-rest") > -1) {
      toastFactory.showSimpleToast("Error in getting topics from kafka-rest");
    } else {
      $log.debug("Normal topics  = " + JSON.stringify(normalTopics));
      $log.debug("Control topics = " + JSON.stringify(controlTopics));
      $scope.topics = normalTopics;
      $scope.controlTopics = controlTopics;
      $rootScope.topicsCache = normalTopics;
      var topicDetailsPromise = kafkaZooFactory.getTopicDetails(normalTopics.concat(controlTopics));
      topicDetailsPromise.then(function (topicDetails) {
        $rootScope.topicDetails = topicDetails;
      }, function (reason) {
        $log.error('Failed: ' + reason);
      }, function (update) {
        $log.info('Got notification: ' + update);
      });

    }
  }, function (reason) {
    $log.error('Failed: ' + reason);
    toastFactory.showSimpleToast("No connectivity. Could not get topic names");
  }, function (update) {
    $log.info('Got notification: ' + update);
  });

  // 2. Get _schemas
  var start = new Date().getTime();
  var schemasPromise = kafkaZooFactory.consumeKafkaRest("json", "_schemas");
  schemasPromise.then(function (allSchemas) {
    var end = new Date().getTime();
    $rootScope.schemas = allSchemas;
    $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allSchemas).length + " schemas from topic _schemas"); //  + JSON.stringify(allSchemas)
  }, function (reason) {
    $log.error('Failed: ' + reason);
  }, function (update) {
    $log.info('Got notification: ' + update);
  });

  $scope.countPartitionsForTopic = function (topicName) {
    var partitions = 0;
    // $log.debug('Counting partitions for topic : ' + topicName);
    angular.forEach($rootScope.topicDetails, function (topicDetail) {
      if (topicDetail.name == topicName) {
        // $log.debug(topicDetail);
        partitions = topicDetail.partitions.length;
      }
    });
    return partitions;
  };

  $scope.isNormalTopic = function (topicName) {
    return (topicName != '_schemas') &&
      (topicName != 'connect-configs') &&
      (topicName != 'connect-status') &&
      (topicName != '__consumer_offsets') &&
      (topicName.indexOf("_confluent") != 0) &&
      (topicName.indexOf("__confluent") != 0);
  };

  $scope.countReplicationForTopic = function (topicName) {
    var replication = 0;
    //$log.debug('Checking replication factor for topic : ' + topicName);
    angular.forEach($rootScope.topicDetails, function (topicDetail) {
      if (topicDetail.name == topicName) {
        // $log.debug("--->" + JSON.stringify(topicDetail.partitions[0].replicas));
        replication = topicDetail.partitions[0].replicas.length;
      }
    });
    return replication;
  };

  $scope.hasExtraConfig = function (topicName) {
    var extra = kafkaZooFactory.hasExtraConfig(topicName);
    return extra;
  };

  $scope.getDataType = function (topicName) {
    return kafkaZooFactory.getDataType(topicName);
  };

  // $scope.topics = ENV.topics;
  //schemaRegistryFactory.visibleCreateSubjectButton(true);
});