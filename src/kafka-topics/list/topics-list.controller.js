angularAPP.controller('KafkaTopicsListCtrl', function ($scope, $rootScope, $routeParams, $mdToast, $log, KafkaRestProxyFactory, toastFactory, $interval) {
  function start() {
  $log.info("Starting kafka-topics controller : list (getting topic info)");
  toastFactory.hideToast();

  /**
   * At start-up fetch the _schemas topic
   */
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
      KafkaRestProxyFactory.getAllTopicInformation(normalTopics).then(
        function success(topicDetails) {
          $rootScope.topicDetails = topicDetails;
          $rootScope.normalTopicDetails = topicDetails;
          // .. only then fetch [Control] topics info
          KafkaRestProxyFactory.getAllTopicInformation(controlTopics).then(
            function success(controlTopicDetails) {
              $rootScope.controlTopicDetails = controlTopicDetails;
            });
        }, function failure(reason) {
          $log.error('Failed: ' + reason);
        });

    }, function (reason) {
      $log.error('Failed: ' + reason);
      toastFactory.showSimpleToast("No connectivity. Could not get topic names");
    }, function (update) {
      $log.info('Got notification: ' + update);
    });
  };
  $interval(start, 5000);
  start();
  $rootScope.displayingControlTopics = false;

  function countPartitionsForTopic(topicName) {
    var partitions = 0;
    angular.forEach($rootScope.topicDetails, function (topicDetail) {
      if (topicDetail.name == topicName) {
        partitions = topicDetail.partitions.length;
      }
    });
    angular.forEach($rootScope.controlTopicDetails, function (topicDetail) {
      if (topicDetail.name == topicName) {
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
      return countReplicationForTopic(topicName) + '  x 1 partition';
    else
      return countReplicationForTopic(topicName) + ' x ' + partitions + ' partitions';
  };

  $scope.isNormalTopic = function (topicName) {
    return KafkaRestProxyFactory.isNormalTopic(topicName);
  };

  function countReplicationForTopic(topicName) {
    var replication = 0;
    //$log.debug('Checking replication factor for topic : ' + topicName);
    angular.forEach($rootScope.topicDetails, function (topicDetail) {
      if (topicDetail.name == topicName) {
        replication = topicDetail.partitions[0].replicas.length;
      }
    });
    angular.forEach($rootScope.controlTopicDetails, function (topicDetail) {
      if (topicDetail.name == topicName) {
        replication = topicDetail.partitions[0].replicas.length;
      }
    });
    return replication;
  }

  $scope.hasExtraConfig = function (topicName) {
    return KafkaRestProxyFactory.hasExtraConfig(topicName);
  };

  $scope.getDataType = function (topicName) {
    return KafkaRestProxyFactory.getDataType(topicName);
  };

  $scope.shortenControlCenterName = function (topicName) {
    return KafkaRestProxyFactory.shortenControlCenterName(topicName);
  }

});
