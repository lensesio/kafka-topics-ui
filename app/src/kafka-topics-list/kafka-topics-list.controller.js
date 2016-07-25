kafkaZooUIApp.controller('KafkaTopicsListCtrl', function ($scope, $rootScope, $routeParams, $mdToast, $log, kafkaZooFactory) {

    $log.debug("KafkaTopicsListCtrl - initializing");
    $mdToast.hide();

    var promise = kafkaZooFactory.getTopicList(false);
    promise.then(function (allTopics) {
      $log.debug('Success fetching allTopics ' + JSON.stringify(allTopics));
      $scope.topics = allTopics;
      $rootScope.topicsCache = allTopics
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