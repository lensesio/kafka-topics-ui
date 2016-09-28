angularAPP.controller('KafkaTopicsListCtrl', function ($scope, $rootScope, $location, $routeParams, $mdToast, $log, KafkaRestProxyFactory, toastFactory) {

  $log.info("Starting kafka-topics controller : list (getting topic info)");
  toastFactory.hideToast();
  $scope.displayingControlTopics = false;
  KafkaRestProxyFactory.loadSchemas();

  /**
   * At start-up get all topic-information
   */
  KafkaRestProxyFactory.getTopicNames().then(
    function success(allTopicNames) {
      $scope.topics = KafkaRestProxyFactory.getNormalTopics(allTopicNames);;
      $scope.controlTopics = KafkaRestProxyFactory.getControlTopics(allTopicNames);;
      $rootScope.topicsCache = $scope.topics; //TODO do we need that??

      KafkaRestProxyFactory.getAllTopicInformation($scope.topics).then(
        function success(topicDetails) {
          $rootScope.topicDetails = topicDetails;

          // .. only then fetch [Control] topics info
          KafkaRestProxyFactory.getAllTopicInformation($scope.controlTopics).then(
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

  /**
   * View functions
   */

  $scope.getPartitionMessage = function (topicName) {
    return doCountsForTopic(topicName);
  };

  $scope.isNormalTopic = function (topicName) {
    return KafkaRestProxyFactory.isNormalTopic(topicName);
  };

  $scope.hasExtraConfig = function (topicName) {
    return KafkaRestProxyFactory.hasExtraConfig(topicName);
  };

  $scope.getDataType = function (topicName) {
    return KafkaRestProxyFactory.getDataType(topicName);
  };

  $scope.shortenControlCenterName = function (topicName) {
    return KafkaRestProxyFactory.shortenControlCenterName(topicName);
  }

  $scope.listClick = function (topicName) {
    $location.url("topic/" + topicName);
  }

  function doCountsForTopic(topicName) {
    var counts = {
        partitions : 0,
        replications : 0
    }

    angular.forEach($rootScope.topicDetails, function (topicDetail) {
      if (topicDetail.name == topicName) {
        counts.replications = topicDetail.partitions[0].replicas.length;
        counts.partitions = topicDetail.partitions.length;
      }
    });

    angular.forEach($rootScope.controlTopicDetails, function (topicDetail) {
      if (topicDetail.name == topicName) {
        counts.replications = topicDetail.partitions[0].replicas.length;
        counts.partitions = topicDetail.partitions.length;
      }
    });

    return doLalbels(counts.replications, 'Replication') + ' x ' + doLalbels(counts.partitions, 'Partition');
  }

  function doLalbels(count, name) {
    if (count == 0) return 'None ' + name;
    else if (count == 1) return '1 ' + name;
    else return count + ' ' + name +'s';
  }
});