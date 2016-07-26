kafkaTopicsUIApp.controller('KafkaTopicsListCtrl', function ($scope, $rootScope, $routeParams, $mdToast, $log, kafkaZooFactory, toastFactory) {

  $log.debug("KafkaTopicsListCtrl - initializing");
  $mdToast.hide();

  // 1. Get topics
  var topicsPromise = kafkaZooFactory.getTopicList();
  topicsPromise.then(function (normalTopics, controlTopics) {
    if (normalTopics.toString().indexOf("Error in getting topics from kafka-rest") > -1) {
      toastFactory.showSimpleToast("Error in getting topics from kafka-rest");
    } else {
      $log.debug('Normal topics = ' + JSON.stringify(normalTopics));
      $scope.topics = normalTopics;
      $rootScope.topicsCache = normalTopics;
      var topicDetailsPromise = kafkaZooFactory.getTopicDetails(normalTopics);
      topicDetailsPromise.then(function (topicDetails) {
        $rootScope.topicDetails = topicDetails;
        $log.info("Got topic details");
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

  $scope.countPartitionsForTopic = function (topicObj) {
    //$log.debug('Counting partitions for topic : ' + JSON.stringify(topicObj));
    if ((topicObj == undefined) || (topicObj.partitions == undefined)) {
      return 0;
    } else {
      return Object.keys(topicObj.partitions).length;
    }
  };

  $scope.hasExtraConfig = function (topicName) {
    var peiler = {};
    angular.forEach($rootScope.topicDetails, function (detail) {
      if (detail.name === topicName) {
        peiler = detail.configs;
      }
    });
    return (JSON.stringify(peiler).replace("{}", ""));
  };

  $scope.getDataType = function (topicName) {
    return kafkaZooFactory.getDataType(topicName);
  };

  // $scope.topics = ENV.topics;
  //schemaRegistryFactory.visibleCreateSubjectButton(true);
});