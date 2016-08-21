angularAPP.controller('KafkaTopicsListCtrl', function ($scope, $rootScope, $routeParams, $mdToast, $log, KafkaRestProxyFactory, toastFactory) {

  $log.info("Starting kafka-topics controller : list (getting topic info)");
  toastFactory.hideToast();

  /**
   * At start-up get all topic-information
   */
  KafkaRestProxyFactory.getTopicNames().then(
    function success(allTopicNames) {

      var normalTopics = KafkaRestProxyFactory.getNormalTopics(allTopicNames);
      var controlTopics = KafkaRestProxyFactory.getControlTopics(allTopicNames);

      //$log.debug("Normal topics  = " + JSON.stringify(normalTopics));
      //$log.debug("Control topics = " + JSON.stringify(controlTopics));
      $scope.topics = normalTopics;
      $scope.controlTopics = controlTopics;
      $rootScope.topicsCache = normalTopics;
      KafkaRestProxyFactory.getAllTopicInformation(normalTopics.concat(controlTopics)).then(
        function success(topicDetails) {
          $rootScope.topicDetails = topicDetails;
        }, function failure(reason) {
          $log.error('Failed: ' + reason);
        });

    }, function (reason) {
      $log.error('Failed: ' + reason);
      toastFactory.showSimpleToast("No connectivity. Could not get topic names");
    }, function (update) {
      $log.info('Got notification: ' + update);
    });

  // 2. Get _schemas
  var start = new Date().getTime();
  var schemasPromise = KafkaRestProxyFactory.consumeKafkaRest("json", "_schemas");
  schemasPromise.then(function (allSchemas) {
    var end = new Date().getTime();
    $rootScope.schemas = allSchemas;
    $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allSchemas).length + " schemas from topic _schemas"); //  + JSON.stringify(allSchemas)
  }, function (reason) {
    $log.error('Failed: ' + reason);
  }, function (update) {
    $log.info('Got notification: ' + update);
  });

  function countPartitionsForTopic(topicName) {
    var partitions = 0;
    // $log.debug('Counting partitions for topic : ' + topicName);
    angular.forEach($rootScope.topicDetails, function (topicDetail) {
      if (topicDetail.name == topicName) {
        // $log.debug(topicDetail);
        partitions = topicDetail.partitions.length;
      }
    });
    return partitions;
  }

  $scope.getPartitionMessage = function (topicName) {
    var partitions = countPartitionsForTopic(topicName);
    if (partitions == 0)
      return '';
    else if (partitions == 1)
      return countReplicationForTopic(topicName) + ' x 1 partition';
    else
      return countReplicationForTopic(topicName) + ' x ' + partitions + 'partitions';
  };

  $scope.isNormalTopic = function (topicName) {
    return KafkaRestProxyFactory.isNormalTopic(topicName);
  };

  function countReplicationForTopic(topicName) {
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
    return KafkaRestProxyFactory.hasExtraConfig(topicName);
  };

  $scope.getDataType = function (topicName) {
    return KafkaRestProxyFactory.getDataType(topicName);
  };

});