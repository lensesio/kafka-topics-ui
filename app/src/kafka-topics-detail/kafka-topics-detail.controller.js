kafkaTopicsUIApp.controller('ViewTopicCtrl', function ($scope, $rootScope, $filter, $routeParams, $sce, $log, $mdToast, $mdDialog, $http, $base64, kafkaZooFactory) {

  $log.info("ViewTopicCtrl - initializing for topic : " + $routeParams.topicName);
  $scope.topicName = $routeParams.topicName;
  $scope.showSpinner = true;

  $scope.topicType = kafkaZooFactory.getDataType($scope.topicName);

  $scope.editor;

  $scope.aceLoaded = function (_editor) {
    $scope.editor = _editor;
    $scope.editor.$blockScrolling = Infinity;
  };

  $scope.isSchemaLong = function (schema) {
    return ((schema != null) && (schema.length >= 42))
  };

  $scope.getSchemaRegistryUrl = function (subject, version) {
    return ENV.SCHEMA_REGISTRY_UI + "/#/subject/" + subject + "/version/" + version;
  };

  $scope.getData = function (topicName) {
    $log.info("Download requested for " + $scope.aceString.length + " bytes ");
    var json = $scope.aceString;
    var blob = new Blob([json], {type: "application/json;charset=utf-8;"});
    var downloadLink = angular.element('<a></a>');
    downloadLink.attr('href', window.URL.createObjectURL(blob));
    downloadLink.attr('download', topicName + '.json');
    downloadLink[0].click();
  };

  // DIALOG //////
  var originatorEv;

  $scope.openMenu = function ($mdOpenMenu, ev) {
    originatorEv = ev;
    $mdOpenMenu(ev);
  };

  $scope.notificationsEnabled = true;
  $scope.toggleNotifications = function () {
    $scope.notificationsEnabled = !$scope.notificationsEnabled;
  };

  $scope.streamFromBeginning = function () {
    $mdDialog.show(
      $mdDialog.alert()
        .targetEvent(originatorEv)
        .clickOutsideToClose(true)
        .parent('body')
        .title('Stream from beginning of topic')
        .textContent('It will take a few moments ...  Have a cookie!')
        .ok('That was easy')
    );

    originatorEv = null;
  };

  $scope.streamInRealTime = function () {
    $log.info("Streaming in real time");
    // This never happens.
  };
  ///////////////////////

  $scope.getShort = function (schema) {
    if (schema == null) {
      return "";
    } else {
      return schema.substring(0, 42);
    }
  };

  $log.debug("topicType=" + JSON.stringify($scope.topicType));
  // If value exists in an array
  function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }

  function setCustomMessage(rows) {
    if ($scope.topicName == "_schemas") {
      $scope.customMessage = "Topic <b>_schemas</b> holds <b>" + rows.length + "</b> registered schemas in the <a href='" + ENV.SCHEMA_REGISTRY_UI + "' target='_blank'>schema-registry</a>"
    } else if ($scope.topicName == "connect-configs") {
      // var connectors =
      $scope.customMessage = "Topic <b>connect-configs</b> holds <b>" + $scope.getConnectors(rows, 'connector-').length + "</b> connector configurations" +
        " and <b>" + $scope.getConnectors(rows,'task-').length + "</b> task configurations";
    }
  }

  // text can be 'connector-' 'task-' 'commit-'
  $scope.getConnectors = function (rows, search) {
    var defaultValue = [];
    angular.forEach(rows, function (row) {
      if (row.key.indexOf(search) == 0) {
        defaultValue.push(row);
      }
    });
    return (defaultValue);
  };

  $scope.getConnector = function (row) {
    var data = JSON.parse(row.value).properties;
    var topics = "";
    if (data.topic != null) {
      topics = topics + data.topic;
    } else if (data.topics != null) {
      topics = topics + data.topics;
    }
    // TODO: This run's 10ns of times ! $log.error(data);
    var a = {
      name: data.name,
      topic: topics,
      tasksmax: data['tasks.max'],
      file: data.file,
      class: data['connector.class']
    };
    return a;
  };

  $scope.getTask = function (row) {
    var data = JSON.parse(row.value).properties;
    var topics = "";
    if (data.topic != null) {
      topics = topics + data.topic;
    } else if (data.topics != null) {
      topics = topics + data.topics;
    }
    // TODO: This run's 10ns of times ! $log.error(data);
    var a = {
      topic: topics,
      file: data.file,
      class: data['task.class']
    };
    return a;
  };

  $scope.getCommit = function (row) {
    var data = JSON.parse(row.value);
    // TODO: This run's 10ns of times ! $log.error(data);
    var a = {
      tasks: data.tasks
    };
    return a;
  };

  // At start-up this controller consumes data
  var start = new Date().getTime();
  if (($scope.topicType == "json") || ($scope.topicType == "binary") || ($scope.topicType == "avro")) {
    var dataPromise = kafkaZooFactory.consumeKafkaRest($scope.topicType, $scope.topicName);
    dataPromise.then(function (allData) {
      var end = new Date().getTime();
      $scope.aceString = allData;
      $scope.rows = JSON.parse(allData);
      setCustomMessage($scope.rows);
      $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allData).length + " " + $scope.topicType + " rows from topic " + $scope.topicName); //  + JSON.stringify(allSchemas)
      $scope.showSpinner = false;
    }, function (reason) {
      $log.error('Failed: ' + reason);
    }, function (update) {
      $log.info('Got notification: ' + update);
    });
  } else {
    $log.warn("We don't really know the data type of topic" + $scope.topicName + " so we will attempt all options..");
    // If we don't know we need to guess by trying Avro -> JSon -> Binary
    var dataPromiseAvro = kafkaZooFactory.consumeKafkaRest("avro", $scope.topicName);
    dataPromiseAvro.then(function (allData) {
      if (JSON.stringify(allData).indexOf("error_code") > 0) {
        $log.warn('Failed with Avro - going to try with Json this time (' + allData + ')');
        var dataPromiseAvro = kafkaZooFactory.consumeKafkaRest("json", $scope.topicName);
        dataPromiseAvro.then(
          function (allData) {
            if (JSON.stringify(allData).indexOf("error_code") > 0) {
              $log.error('Failed with JSon as well - going to try with Binary this time (' + allData + ')');
              var dataPromiseAvro = kafkaZooFactory.consumeKafkaRest("binary", $scope.topicName);
              dataPromiseAvro.then(function (allData) {
                $log.info("Binary detected");
                var end = new Date().getTime();
                $scope.topicType = "binary";
                $scope.aceString = allData;
                $scope.rows = allData;
                setCustomMessage($scope.rows);
                $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allData).length + " " + $scope.topicType + " rows from topic " + $scope.topicName); //  + JSON.stringify(allSchemas)
                $scope.showSpinner = false;
              }, function (reason) {
                $log.error('Failed with Binary as well ?! :(  (' + reason + ')');
              });
            } else {
              $log.info("JSon detected");
              var end = new Date().getTime();
              $scope.topicType = "json";
              $scope.aceString = allData;
              $scope.rows = allData;
              setCustomMessage($scope.rows);
              $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allData).length + " " + $scope.topicType + " rows from topic " + $scope.topicName); //  + JSON.stringify(allSchemas)
              $scope.showSpinner = false;
            }
          }, function (reason) {
          });
      } else {
        $log.info("Avro detected" + allData);
        var end = new Date().getTime();
        $scope.topicType = "avro";
        $scope.aceString = allData;
        $scope.rows = allData;
        setCustomMessage($scope.rows);
        $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allData).length + " " + $scope.topicType + " rows from topic " + $scope.topicName); //  + JSON.stringify(allSchemas)
        $scope.showSpinner = false;
      }
    }, function (reason) {
    });
  }

  //tODO
  $scope.myTopic = $filter('filter')($rootScope.topicsCache, {name: $scope.topicName}, true);

  ///////////////////////////////////////////
  $mdToast.hide();
  $scope.kafkaDefaults = KAFKA_DEFAULTS; //TODO
  $scope.topicsOn = true;
  $scope.zookeeperInfo = "zookeeper.landoop.com.info.goes.here";
  $scope.brokers = ENV.BROKERS;

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
        setCustomMessage($scope.rows);
      }, function (reason) {
        $log.error('Failed: ' + reason);
      }, function (update) {
        $log.info('Got notification: ' + update);
      }
    );
  }
  ;

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