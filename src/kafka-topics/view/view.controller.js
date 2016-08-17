angularAPP.controller('ViewTopicCtrl', function ($scope, $rootScope, $filter, $routeParams, $log, $mdToast, $mdDialog, $http, $base64, KafkaRestProxyFactory) {

  $log.info("ViewTopicCtrl - initializing for topic : " + $routeParams.topicName);
  $scope.topicName = $routeParams.topicName;
  $scope.showSpinner = true;

  $scope.topicType = KafkaRestProxyFactory.getDataType($scope.topicName);

  $scope.editor;

  $scope.aceLoaded = function (_editor) {
    $scope.editor = _editor;
    $scope.editor.$blockScrolling = Infinity;
  };

  $scope.isSchemaLong = function (schema) {
    return ((schema != null) && (schema.length >= 42))
  };

  $scope.getSchemaRegistryUrl = function (subject, version) {
    return ENV.APPS[0].urlSchema + "/#/subject/" + subject + "/version/" + version;
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
    var kbytesFromBeginning = $mdDialog.alert()
      .title('Stream from beginning of topic')
      .textContent('Will fetch 100 KBytes of data from topic')
      .targetEvent(originatorEv)
      .clickOutsideToClose(true)
      .ok('Okay!');

    $mdDialog.show(kbytesFromBeginning).then(function () {
      $log.info("Streaming from beginning");
      $scope.consumeKafkaRest($scope.topicType, $scope.topicName);
    });

    originatorEv = null;
  };

  $scope.hasExtraConfig = function (topicName) {
    var extra = KafkaRestProxyFactory.hasExtraConfig(topicName);
    if (extra != '') {
      // $log.debug("Topic details " + topicName + " HAS EXTRA CONFIG " + extra);
    }
    return extra;
  };

  $scope.getExtraConfig = function (topicName) {
    var extra = KafkaRestProxyFactory.hasExtraConfig(topicName);
    return JSON.parse(extra);
  };

  $scope.getDefautConfigValue = function (configKey) {
    var defaultConfigValue = "";
    angular.forEach(KAFKA_DEFAULTS, function (kafkaDefault) {
      if (kafkaDefault.property == configKey) {
        defaultConfigValue = kafkaDefault.default;
      }
    });
    return defaultConfigValue;
  };

  $scope.getConfigDescription = function (configKey) {
    var configDescription = "";
    angular.forEach(KAFKA_DEFAULTS, function (kafkaDefault) {
      if (kafkaDefault.property == configKey) {
        configDescription = kafkaDefault.description;
      }
    });
    return configDescription;
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

  function isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  function setCustomMessage(rows) {
    if ($scope.topicName == "_schemas") {
      $scope.customMessage = "Topic <b>_schemas</b> holds <b>" + rows.length + "</b> registered schemas in the <a href='" + ENV.APPS[0].urlSchema + "' target='_blank'>schema-registry</a>"
    } else if ($scope.topicName == "connect-configs") {
      $scope.customMessage = "Topic <b>connect-configs</b> holds <b>" + $scope.getConnectors(rows, 'connector-').length + "</b> connector configurations" +
        " and <b>" + $scope.getConnectors(rows, 'task-').length + "</b> task configurations";
    } else if ($scope.topicName == "connect-offsets") {
      $scope.customMessage = "Topic <b>connect-offsets</b> holds the offsets of your connectors. Displaying <b>" + rows.length + "</b> rows";
    } else if ($scope.topicName == "connect-status") {
      $scope.customMessage = "Topic <b>connect-status</b> holds <b>" + $scope.getCompactedConnectStatus(rows, 'RUNNING').length + "</b> RUNNING connectors";
    } else {
      if (isJson(rows)) {
        $scope.customMessage = "Displaying " + JSON.parse(rows).length + " rows ";// + KafkaRestProxyFactory.bytesToSize(rows.length);
      } else {
        $scope.customMessage = "Displaying " + rows.length + " rows ";// + KafkaRestProxyFactory.bytesToSize(rows.length);
      }
    }
  }

  // text can be 'connector-' 'task-' 'commit-'
  $scope.getConnectors = function (rows, search) {
    var defaultValue = [];
    //$log.error(rows);
    if (rows != undefined) {
      angular.forEach(rows, function (row) {
        if (row.key.indexOf(search) == 0) {
          defaultValue.push(row);
        }
      });
    }
    return (defaultValue);
  };

  // Get the keys ..
  $scope.getTopicKeys = function (rows) {
    var allTopicKeys = ["key", "partition", "offset"];
    if (rows != undefined) {
      angular.forEach(angular.fromJson(rows), function (row) {
        // $log.info("data= " + JSON.stringify(row.value));
        if (JSON.stringify(row.value) != null && JSON.stringify(row.value).indexOf("{\\") == 0) {
          angular.forEach(JSON.parse(row.value), function (value, key) {
            //$log.info("Key-Value = " + key + " value=" + value);
            if (!isInArray(key, allTopicKeys)) {
              allTopicKeys.push(key);
            }
          });
        } else {
          // $log.info(" value=" + row.value);
          if (!isInArray("value", allTopicKeys)) {
            allTopicKeys.push("value");
          }
        }
        // TODO
      });
      // $log.info("Completeeeed " + JSON.stringify(rows).length);
      $scope.totalKeys = allTopicKeys.length;
    }
    // else {
    //   $log.debug("Undefined");
    // }
    return allTopicKeys;
  };

  $scope.getTopicValues = function (rows) {
    var allTopicValues = [];
    angular.forEach(angular.fromJson(rows), function (row) {
      // $log.debug(row + "    " + JSON.stringify(row.value));
      var x = {};
      x.key = row.key;
      x.partition = row.partition;
      x.offset = row.offset;
      if (JSON.stringify(row.value) != null && JSON.stringify(row.value).indexOf("{\"") == 0) {
        x.extraDataFlattened = [];
        // $log.error("Value is JSon->" + JSON.stringify(row.value));
        angular.forEach(row.value, function (peiler) {
          //$log.debug("peiler = " + peiler);
          x.extraDataFlattened.push(peiler);
        });
      } else {
        x.extraDataFlattened = [];
        // $log.info("Key= " + key + " value= " + value);
        if (row.value != undefined) {
          x.extraDataFlattened.push(row.value);
        }
      }
      allTopicValues.push(x);
    });
    // $log.debug("XXX " + JSON.stringify(allTopicValues));
    $scope.allTopicValues = allTopicValues;
    return allTopicValues;
  };

  // Get `connect-status`
  $scope.getConnectStatus = function (rows, search) {
    var connectStatuses = [];
    angular.forEach(rows, function (row) {
      if (row.value != undefined && row.value.indexOf("{\"") != -1) {
        var data = JSON.parse(row.value);
        if (search == '') {
          row.state = data.state;
          row.trace = data.trace;
          row.workerId = data.worker_id;
          row.generation = data.generation;
          connectStatuses.push(row);
        } else if (search == "RUNNING") {
          if (data.state == "RUNNING") {
            row.state = data.state;
            row.trace = data.trace;
            row.workerId = data.worker_id;
            row.generation = data.generation;
            connectStatuses.push(row);
          }
        } else if (search == "UNASSIGNED") {
          if (data.state == "UNASSIGNED") {
            row.state = data.state;
            row.trace = data.trace;
            row.workerId = data.worker_id;
            row.generation = data.generation;
            connectStatuses.push(row);
          }
        }
      } else {
        //TODO
        //$log.debug("Don't know what to do with -> " + JSON.stringify(row));
      }
    });
    return (connectStatuses);
  };

  $scope.getCompactedConnectStatus = function (rows) {
    // var rowsInverted = rows.slice().reverse();
    var allKeys = [];
    var allStatuses = $scope.getConnectStatus(rows, '').reverse();
    var compactedStatuses = [];
    angular.forEach(allStatuses, function (row) {
      if (allKeys.indexOf(row.key) == -1) {
        allKeys.push(row.key);
        compactedStatuses.push(row);
      }
    });
    return compactedStatuses;
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
    var connectorData = {
      name: data.name,
      topic: topics,
      tasksmax: data['tasks.max'],
      file: data.file,
      class: data['connector.class']
    };
    return connectorData;
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
    var taskData = {
      topic: topics,
      file: data.file,
      class: data['task.class']
    };
    return taskData;
  };

  $scope.getCommit = function (row) {
    var data = JSON.parse(row.value);
    // TODO: This run's 10ns of times ! $log.error(data);
    var commitData = {
      tasks: data.tasks
    };
    return commitData;
  };

  $scope.isNormalTopic = function (topicName) {
    return (topicName != '_schemas') &&
      (topicName != 'connect-configs') &&
      (topicName != 'connect-status') &&
      (topicName != '__consumer_offsets') &&
      (topicName.indexOf("_confluent") != 0) &&
      (topicName.indexOf("__confluent") != 0);
  };

  // At start-up this controller consumes data
  var start = new Date().getTime();
  if (($scope.topicType == "json") || ($scope.topicType == "binary") || ($scope.topicType == "avro")) {
    var dataPromise = KafkaRestProxyFactory.consumeKafkaRest($scope.topicType, $scope.topicName);
    dataPromise.then(function (allData) {
      var end = new Date().getTime();
      $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allData).length + " " + $scope.topicType + " rows from topic " + $scope.topicName); //  + JSON.stringify(allSchemas)
      $scope.aceString = allData;
      $scope.rows = JSON.parse(allData);
      setCustomMessage($scope.rows);
      $scope.getTopicValues($scope.rows);
      end = new Date().getTime();
      $log.info("[" + (end - start) + "] msec - to get & render"); //  + JSON.stringify(allSchemas)
      $scope.showSpinner = false;
    }, function (reason) {
      $log.error('Failed: ' + reason);
    }, function (update) {
      $log.info('Got notification: ' + update);
    });
  } else {
    $log.warn("We don't really know the data type of topic" + $scope.topicName + " so we will attempt all options..");
    // If we don't know we need to guess by trying Avro -> JSon -> Binary
    var dataPromiseAvro = KafkaRestProxyFactory.consumeKafkaRest("avro", $scope.topicName);
    dataPromiseAvro.then(function (allData) {
      if (JSON.stringify(allData).indexOf("error_code") > 0) {
        $log.warn('Failed with Avro - going to try with Json this time (' + allData + ')');
        var dataPromiseAvro = KafkaRestProxyFactory.consumeKafkaRest("json", $scope.topicName);
        dataPromiseAvro.then(
          function (allData) {
            if (JSON.stringify(allData).indexOf("error_code") > 0) {
              $log.error('Failed with JSon as well - going to try with Binary this time (' + allData + ')');
              var dataPromiseAvro = KafkaRestProxyFactory.consumeKafkaRest("binary", $scope.topicName);
              dataPromiseAvro.then(function (allData) {
                $log.info("Binary detected");
                var end = new Date().getTime();
                $scope.topicType = "binary";
                $scope.aceString = allData;
                $scope.rows = allData;
                setCustomMessage($scope.rows);
                $scope.getTopicValues($scope.rows);
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
              $scope.getTopicValues($scope.rows);
              $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allData).length + " " + $scope.topicType + " rows from topic " + $scope.topicName); //  + JSON.stringify(allSchemas)
              $scope.showSpinner = false;
            }
          }, function (reason) {
          });
      } else {
        // $log.info("Avro detected" + allData);
        var end = new Date().getTime();
        $scope.topicType = "avro";
        $scope.aceString = allData;
        $scope.rows = allData;
        setCustomMessage($scope.rows);
        $scope.getTopicValues($scope.rows);
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
    var dataPromise = KafkaRestProxyFactory.consumeKafkaRest(messagetype, topicName);
    dataPromise.then(function (data) {
        $scope.aceString = data;
        $scope.rows = data;
        $scope.showSpinner = false;
        setCustomMessage($scope.rows);
        $scope.getTopicValues($scope.rows);
      }, function (reason) {
        $log.error('Failed: ' + reason);
      }, function (update) {
        $log.info('Got notification: ' + update);
      }
    );
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