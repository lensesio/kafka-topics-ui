kafkaTopicsUIApp.controller('KafkaTopicsListCtrl', function ($scope, $rootScope, $routeParams, $mdToast, $log, kafkaZooFactory) {

    $log.debug("KafkaTopicsListCtrl - initializing");
    $mdToast.hide();

    // 1. Get topics
    var topicsPromise = kafkaZooFactory.getTopicList();
    topicsPromise.then(function (normalTopics, controlTopics) {
      $log.debug('Normal topics = ' + JSON.stringify(normalTopics));
      $scope.topics = normalTopics;
      $rootScope.topicsCache = normalTopics
    }, function (reason) {
      $log.error('Failed: ' + reason);
      kafkaZooFactory.showSimpleToast("No connectivity. Could not get topic names");
    }, function (update) {
      $log.info('Got notification: ' + update);
    });

    // 2. Get _schemas
    var start = new Date().getTime();
    var schemasPromise = kafkaZooFactory.consumeKafkaRest("json","_schemas");
    schemasPromise.then(function(allSchemas) {
      var end = new Date().getTime();
      $rootScope.schemas = allSchemas;
      $log.info("[" + (end-start) + "] msec - to get " + allSchemas.length + " schemas from topic _schemas"); //  + JSON.stringify(allSchemas)
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

    // $scope.topics = ENV.topics;
    //schemaRegistryFactory.visibleCreateSubjectButton(true);
  });