kafkaTopicsUIApp.controller('ViewTopicCtrl', function ($scope, $rootScope, $filter, $routeParams, $log, $mdToast, $http, $base64, kafkaZooFactory) {

  $log.info("ViewTopicCtrl - initializing for topic : " + $routeParams.topicName);
  $scope.topicName = $routeParams.topicName;
  $scope.showSpinner = true;

  if ($scope.topicName == "_schemas") {
    $scope.topicType = "json";
  } else if (isInArray($scope.topicName, ["connect-configs", "connect-offsets", "connect-status"])) {
    $scope.topicType = "binary";
  }

  function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }

  // If _schemas
  if ($scope.topicName == "_schemas") {
    var start = new Date().getTime();
    var schemasPromise = kafkaZooFactory.consumeKafkaRest("json", "_schemas");
    schemasPromise.then(function (allSchemas) {
      var end = new Date().getTime();
      $scope.aceString = allSchemas;
      $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allSchemas).length + " schemas from topic _schemas"); //  + JSON.stringify(allSchemas)
      $scope.showSpinner = false;
    }, function (reason) {
      $log.error('Failed: ' + reason);
    }, function (update) {
      $log.info('Got notification: ' + update);
    });
  } else
  // If connect topics -> Binary
  if (isInArray($scope.topicName, ["connect-configs", "connect-offsets", "connect-status"])) {
    var start = new Date().getTime();
    var schemasPromise = kafkaZooFactory.consumeKafkaRest("binary", $scope.topicName);
    schemasPromise.then(function (allSchemas) {
      $scope.showSpinner = false;
      var end = new Date().getTime();
      $scope.aceString = allSchemas;
      $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allSchemas).length + " schemas from topic _schemas"); //  + JSON.stringify(allSchemas)
    }, function (reason) {
      $log.error('Failed: ' + reason);
    }, function (update) {
      $log.info('Got notification: ' + update);
    });
  }

  var topicsMap = {};
  topicsMap["_schemas"] = "json";
  topicsMap["connect-configs"] = "binary";
  topicsMap["connect-offsets"] = "binary";
  topicsMap["connect-status"] = "binary";
  // $log.info(topicsMap["_schemas"]);

  //tODO
  $scope.myTopic = $filter('filter')($rootScope.topicsCache, {name: $scope.topicName}, true);

  ///////////////////////////////////////////
  $mdToast.hide();
  $scope.kafkaDefaults = KAFKA_DEFAULTS; //TODO
  $scope.topicsOn = true;
  $scope.zookeeperInfo = "zookeeper.landoop.com.info.goes.here";
  $scope.brokers = ENV.BROKERS;

  $scope.isAvro = false;
  $scope.isJson = false;
  $scope.isBinary = false;

  $scope.changeView = function () {
    $scope.topicsOn = !$scope.topicsOn;
  };

  // 1. Create a consumer for Avro data, starting at the beginning of the topic's log.
  // 2. Then consume some data from a topic, which is decoded, translated to JSON, and included in the response.
  // The schema used for deserialization is fetched automatically from the schema registry.
  // 3. Finally, clean up.
  // [ avro | json | binary ]
  $scope.consumeKafkaRest = function (messagetype, topicName) {
    $scope.showSpinner = true;
    var dataPromise = kafkaZooFactory.consumeKafkaRest(messagetype, topicName);
    dataPromise.then(function (data) {
      $scope.aceString = data;
      $scope.rows = data;
      $scope.showSpinner = false;
    }, function (reason) {
      $log.error('Failed: ' + reason);
    }, function (update) {
      $log.info('Got notification: ' + update);
    });
  };

  // TOPICS
  $scope.selectedTopic;
  $scope.selectTopic = function (topicObj) {
    $scope.selectedTopic = topicObj
  };

  $scope.getLeader = function (partitions) {
    if (partitions.length > 0) return partitions[0];
  };

  $scope.getTailPartitions = function (partitions) {
    return partitions.slice(1);
  };

  $scope.getKafkaDefaultValue = function (key) {
    var defaultValue;
    angular.forEach(KAFKA_DEFAULTS, function (item) {
      if (item.property == key) {
        defaultValue = item.default;
      }
    });
    return defaultValue;
  };

  $scope.getKafkaDefaultDescription = function (key) {
    var defaultValue;
    angular.forEach(KAFKA_DEFAULTS, function (item) {
      if (item.property == key) {
        defaultValue = item.description;
      }
    });
    return defaultValue;
  };

  // BROKERS
  $scope.selectedBroker;
  $scope.selectBroker = function (brokerObj) {
    $scope.selectedBroker = brokerObj
  }

});