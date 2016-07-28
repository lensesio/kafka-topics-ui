kafkaTopicsUIApp.controller('KafkaTopicsListCtrl', function ($scope, $rootScope, $routeParams, $mdToast, $log, kafkaZooFactory, toastFactory) {

  $log.debug("KafkaTopicsListCtrl - initializing");
  $mdToast.hide();

  // 1. Get topics
  var topicsPromise = kafkaZooFactory.getTopicList();
  topicsPromise.then(function (result) {
    var normalTopics=result.normal;
    var controlTopics=result.control;

    if (normalTopics.toString().indexOf("Error in getting topics from kafka-rest") > -1) {
      toastFactory.showSimpleToast("Error in getting topics from kafka-rest");
    } else {
      $log.debug("Normal topics  = " + JSON.stringify(normalTopics));
      $log.debug("Control topics = " + JSON.stringify(controlTopics));
      $scope.topics = normalTopics;
      $scope.controlTopics = controlTopics;
      $rootScope.topicsCache = normalTopics;
      var topicDetailsPromise = kafkaZooFactory.getTopicDetails(normalTopics);
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

  $scope.countPartitionsForTopic = function (topicObj) {
    //$log.debug('Counting partitions for topic : ' + JSON.stringify(topicObj));
    if ((topicObj == undefined) || (topicObj.partitions == undefined)) {
      return 0;
    } else {
      return Object.keys(topicObj.partitions).length;
    }
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