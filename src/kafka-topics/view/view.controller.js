angularAPP.controller('ViewTopicCtrl', function ($scope, $rootScope, $filter, $routeParams, $log, $mdToast, $location, $mdDialog, $http, KafkaRestProxyFactory, UtilsFactory, env) {

  $log.info("Starting kafka-topics controller : view ( topic = " + $routeParams.topicName + " )");
  $scope.topicName = $routeParams.topicName;
  $rootScope.topicName = $routeParams.topicName;

  $scope.topicCategoryUrl = $routeParams.topicCategoryUrl;
  $rootScope.topicCategoryUrl = $routeParams.topicCategoryUrl;
  $scope.$on('$routeChangeSuccess', function() {
    $scope.cluster = env.getSelectedCluster().NAME;//$routeParams.cluster;
  })

    if ($routeParams.selectedTabIndex == "topic") {
      $scope.selectedTabNnumber=0;
    }
    else if ($routeParams.selectedTabIndex == "table") {
      $scope.selectedTabNnumber=1;
    }
    else if ($routeParams.selectedTabIndex == "rawdata") {
      $scope.selectedTabNnumber=2;
    }
    else if ($routeParams.selectedTabIndex == "config") {
      $scope.selectedTabNnumber=3;
    }
    else {
      $scope.selectedTabNnumber=0;
    }

    $scope.onTabChanges = function(currentTabIndex){
        $location.path ("cluster/"+ $scope.cluster + "/topic/" +  $scope.topicCategoryUrl + "/" + $scope.topicName + "/" + currentTabIndex, false);
    };

  $scope.showSpinner = true;
  $scope.KAFKA_TOPIC_DELETE_COMMAND = TOPIC_CONFIG.KAFKA_TOPIC_DELETE_COMMAND;

  /************* UI-GRID **************/
  $scope.gridOptions = {
    enableSorting: true,
    enableColumnResizing: true,
    // rowHeight: 3,
    columnDefs: [
      {field: 'offset', maxWidth: 75, cellClass: 'grid-center', headerCellClass: 'grid-header-landoop'},
      {field: 'partition', maxWidth: 75, cellClass: 'grid-center', headerCellClass: 'grid-header-landoop-small'},
      {field: 'key', cellClass: 'red', width: 150, headerCellClass: 'grid-header-landoop'},
      {
        field: 'value', headerCellClass: 'grid-header-landoop',
        cellTooltip: function (row, col) {
          return 'a' + row.entity.value;
        }
      }
    ]
  };
  // *********** UI- GRID **********

  $scope.topicType = KafkaRestProxyFactory.getDataType($scope.topicName);

  $scope.editor;

  $scope.aceLoaded = function (_editor) {
    $scope.editor = _editor;
    $scope.editor.$blockScrolling = Infinity;
    _editor.setOptions({
      minLines: 33,
      maxLines: 33
    });

  };

  $scope.isSchemaLong = function (schema) {
    return ((schema != null) && (schema.length >= 42))
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

  $scope.getExtraConfig = function (topicName) {
    var topicDetails = KafkaRestProxyFactory.isNormalTopic(topicName) ? $rootScope.topicDetails : $rootScope.controlTopicDetails;
    var extra = KafkaRestProxyFactory.hasExtraConfig(topicName, topicDetails);
    if (extra)
    return JSON.parse(extra);
    else return ''
  };

  $scope.getDefaultConfigValue = function (configKey) {
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

   $scope.showMoreDesc = [];
   $scope.ToggleMoreDesc = function (index) {
      $scope.showMoreDesc[index] = !$scope.showMoreDesc[index];
   };

  $scope.streamInRealTime = function () {
    $log.info("Streaming in real time");
    // This never happens.
  };
  ///////////////////////

  $log.debug("topicType=" + JSON.stringify($scope.topicType));
  // If value exists in an array
  function isInArray(value, array) {
    return array.indexOf(value) > -1;
  }

  function setCustomMessage(rows) {
    var totalRows = 0;
    if ($scope.topicName == "_schemas") {
      totalRows = rows.length;
      $scope.customMessage = "Topic <b>_schemas</b> holds <b>" + totalRows + "</b> registered schemas for the schema-registry"
    } else if ($scope.topicName == "connect-configs") {
      totalRows = rows.length;
      $scope.customMessage = "Topic <b>connect-configs</b> holds <b>" + $scope.getConnectors(rows, 'connector-').length + "</b> connector configurations" +
        " and <b>" + $scope.getConnectors(rows, 'task-').length + "</b> task configurations";
    } else if ($scope.topicName == "connect-offsets") {
      totalRows = rows.length;
      $scope.customMessage = "Topic <b>connect-offsets</b> holds the offsets of your connectors. Displaying <b>" + totalRows + "</b> rows";
    } else if ($scope.topicName == "connect-status") {
      totalRows = rows.length;
      // $scope.customMessage = "Topic <b>connect-status</b> holds <b>" + $scope.getCompactedConnectStatus(rows, 'RUNNING').length + "</b> RUNNING connectors";
      $scope.customMessage = "";
    } else {
      if (UtilsFactory.IsJsonString(rows)) {
        totalRows = JSON.parse(rows).length;
        $scope.customMessage = "Displaying " + totalRows + " rows ";// + KafkaRestProxyFactory.bytesToSize(rows.length);
      } else {
        totalRows = rows.length;
        $scope.customMessage = "Displaying " + totalRows + " rows ";// + KafkaRestProxyFactory.bytesToSize(rows.length);
      }
    }
    $scope.topicIsEmpty = totalRows == 0;

    $scope.gridOptions.data = rows; //TODO removeme
    return totalRows;
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

  $scope.getConnector = function (row) {
    if (row.value.length >= 5) {
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
    }
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
    return ['_schemas', 'connect-status'].indexOf(topicName) == -1;
  };

  $scope.isControlTopic = function(topicName) {
     return !KafkaRestProxyFactory.isNormalTopic(topicName);
  };

  // At start-up this controller consumes data
  var start = new Date().getTime();
  if (($scope.topicType == "json") || ($scope.topicType == "binary") || ($scope.topicType == "avro")) {
    var dataPromise = KafkaRestProxyFactory.consumeKafkaRest($scope.topicType, $scope.topicName);
    dataPromise.then(function (allData) {
      var end = new Date().getTime();
      $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allData).length + " " + $scope.topicType + " rows from topic " + $scope.topicName); //  + JSON.stringify(allSchemas)

      $scope.aceString = angular.toJson(allData, true);
      $scope.rows = allData;
      setCustomMessage($scope.rows);
      flattenTable(allData);
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
      if (JSON.stringify(allData).indexOf("error") > 0) {
        $log.warn('Failed with Avro - going to try with Json this time (' + allData + ')');
        var dataPromiseAvro = KafkaRestProxyFactory.consumeKafkaRest("json", $scope.topicName);
        dataPromiseAvro.then(
          function (allData) {
            if (JSON.stringify(allData).indexOf("error_code") > 0) {
              $log.warn('Failed with JSon as well - going to try with Binary this time (' + allData + ')');
              var dataPromiseAvro = KafkaRestProxyFactory.consumeKafkaRest("binary", $scope.topicName);
              dataPromiseAvro.then(function (allData) {
                $log.info("Binary detected");
                var end = new Date().getTime();
                $scope.topicType = "binary";
                $scope.aceString = angular.toJson(allData, true);
                $scope.rows = allData;
                setCustomMessage($scope.rows);
                flattenTable(allData);
                angular.fromJson($scope.rows);
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
              flattenTable(allData);
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
        $scope.aceString = angular.toJson(allData, true);
        $scope.rows = allData;
        setCustomMessage($scope.rows);
        flattenTable(allData);
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
  //$scope.brokers = env.BROKERS();

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
        flattenTable(data);
        $scope.getTopicValues($scope.rows);
      }, function (reason) {
        $log.error('Failed: ' + reason);
      }, function (update) {
        $log.info('Got notification: ' + update);
      }
    );
  };

  // TOPICS
  $rootScope.selectedTopic;
  $scope.selectTopic = function (topicObj) {
    $rootScope.selectedTopic = topicObj
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
  };


  /**
   * TODO: Move to utils
   */

  // This one is called each time - the user clicks on an md-table header (applies sorting)
  $scope.logOrder = function (a) {
    $log.info("Ordering event " + a);
    sortSchema(a);
  };

  function sortSchema(type) {
    var reverse = 1;
    if (type.indexOf('-') == 0) {
      // remove the - symbol
      type = type.substring(1, type.length);
      reverse = -1;
    }
    // $log.info(type + " " + reverse);
    $scope.rows = UtilsFactory.sortByKey($scope.rows, type, reverse);
  }

   //TODO move to service
    var flattenObject = function(ob) {
    	var toReturn = {};

    	for (var i in ob) {
    		if (!ob.hasOwnProperty(i)) continue;

    		if ((typeof ob[i]) == 'object') {
    			var flatObject = flattenObject(ob[i]);

    			for (var x in flatObject) {
    				if (!flatObject.hasOwnProperty(x)) continue;
    				toReturn[i + '.' + x] = flatObject[x];
    			}

    		} else {
    			toReturn[i] = ob[i];
    		}
    	}
    	return toReturn;
    };

 function flattenTable(rows) {

        var extraColumnsNumberValue = 0;
        var extraColumnsNumberKey = 0;
        var rowWithMoreColumns;
        $scope.flatRows = [];
        if (rows.length > 0) {
            angular.forEach(rows, function (row) {
                  if (row.key == undefined || row.key == null) row.key = '';
                  if (row.value == undefined || row.value == null) row.value = '';

                  if(angular.isNumber(row.value) || angular.isString(row.value)) {
                        extraColumnsNumberValue = 0
                        extraColumnsNumberKey = 0
                        var newRow = {
                            "offset" : row.offset,
                            "partition" : row.partition,
                            "key" : row.key,
                            "value" : row.value
                        }
                        $scope.cols = Object.keys(flattenObject(newRow));
                        $scope.cols2 = [];
                        $scope.cols3 = [];
                  } else {
                        var flatValue = flattenObject(row.value);
                        var flatKey = flattenObject(row.key);
                        var rowExtraColumnsValues = Object.keys(flatValue).length;
                        var rowExtraColumnsKeys = Object.keys(flatKey).length;

                        if(extraColumnsNumberValue < rowExtraColumnsValues) {
                            extraColumnsNumberValue = rowExtraColumnsValues;
                            rowWithMoreColumns = row;
                        }

                        if(extraColumnsNumberKey < rowExtraColumnsKeys) {
                            extraColumnsNumberKey = rowExtraColumnsKeys;
                            rowWithMoreColumns = row;
                        }

                        var newRow = {
                            "offset" : rowWithMoreColumns.offset,
                            "partition" : rowWithMoreColumns.partition,
                            "key" : rowWithMoreColumns.key,
                            "value" : rowWithMoreColumns.value
                        }

                        $scope.cols =  Object.keys(flattenObject(newRow));
                        $scope.cols2 = Object.keys(flattenObject(newRow.value));
                        $scope.cols3 = Object.keys(flattenObject(newRow.key));
                  }

                  $scope.flatRows.push(flattenObject(row));

                });

                $scope.extraColsNumValues = extraColumnsNumberValue;
                $scope.extraColsNumKeys = extraColumnsNumberKey;

         $scope.paginationItems = 10;
         $scope.showHideAllButtonLabel = 'show ' + rows.length;
     }
}

 $scope.showTree = function (keyOrValue) {
    return !(angular.isNumber(keyOrValue) || angular.isString(keyOrValue) || (keyOrValue==null));
 }

$scope.showChart = true;
$scope.toggleChart = function () {
$scope.showChart = !$scope.showChart;
}

KafkaRestProxyFactory.getTopicMetadata($scope.topicName).then(function (metaData) {
  $scope.partitions = metaData.partitions.length;
  $scope.getPartitions = function(num) {
    return Array.apply(null, {length: num}).map(Number.call, Number)
  }
});


  $scope.kcqlRequest = function() {
  var kcqlQuery = $scope.search.split(' ').join('+');
  $http.get("http://fast-data-backend.demo.landoop.com/api/rest/topics/kcql?query="+kcqlQuery).then(function response(response){
  $log.info('KCQL Responce: ',response)

  });
  }

 /************************* md-table ***********************/
  $scope.tableOptions = {
    rowSelection: false,
    multiSelect: false,
    autoSelect: false,
    decapitate: false,
    largeEditDialog: false,
    boundaryLinks: false,
    limitSelect: true,
    pageSelect: true
  };

  $scope.query = {
    order: 'partition',
    limit: 100,
    page: 1
  };

  // This one is called each time - the user clicks on an md-table header (applies sorting)
  $scope.logOrder = function (a) {
    // $log.info("Ordering event " + a);
    sortTopic(a);
  };

  function sortTopic(type) {
    var reverse = 1;
    if (type.indexOf('-') == 0) {
      // remove the - symbol
      type = type.substring(1, type.length);
      reverse = -1;
    }
     $log.info(type + " " + reverse);
    $scope.flatRows = UtilsFactory.sortByKey($scope.flatRows, type, reverse);
  }



function getFormattedDate(date) {
    if(date){var date = new Date(date);} else {var date = new Date();}
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str;
}

function getFormattedNow() {
    var date = new Date();
    var str = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +  date.getHours() + ":" + date.getMinutes() + ":" + date.getSeconds();
    return str;
}

function rand() {
  return Math.random();
}


$http.get("http://cloudera03.landoop.com:16885/api/topics/chart?topicName=device-measurements-topic").then(function response(response){
var i=0;
var xx = [getFormattedDate(response.data.pointStart)]
for(i= 1; i < response.data.dataLength; i++) {
xx.push(response.data.pointStart + (i * response.data.pointInterval ))
}

//Plotly.plot('tester', {
//  data: [{
//    y: response.data.data,//response.data.data, or [] gia na ksekinaei xwris data
//    x: xx//xx or [] gia na ksekinaei xwris data
//  }],
//  layout: {
//  "autosize": true,
//  "type": "linear",
//  "breakpoints": [],
//  "xaxis": {"type": "date"}
//  }
//
//});

$scope.showButton=true;
});
//
//var interval = setInterval(function() {
//$http.get("http://cloudera03.landoop.com:16885/api/topics/latest?topicName=device-measurements-topic").then(function response(response){
//  Plotly.extendTraces('tester', {
//    y: [[parseInt(response.data)]],
//    x: [[getFormattedNow()]]
//  }, [0])
//
//  });
//}, 2000);



$scope.isCollapsed = false;

$scope.collapseChart = function () {
   $scope.isCollapsed = !$scope.isCollapsed;
}

$scope.chartSelection = ""
 $http.get("http://localhost:8080/api/rest/topics/chart/"+$scope.topicName+'?offsetStart=0').then(function response(response){
    console.log("AAAA ",response.data);

            var yAxisMessagesCounts = [];
            var yAxisOffset = [];
            var yAxisRate =[];
            angular.forEach(response.data.data, function(measurement) {
                yAxisMessagesCounts.push(measurement.messageCount);
                yAxisOffset.push(measurement.offset);
                yAxisRate.push(measurement.rate);
            })



            var chart = {
                chart: {
                    zoomType: 'x',
                    events: {
                        load: function () {
                             var series = this.series[0];
//                             setInterval(function () {
//                             $http.get("http://localhost:8080/api/topics/latest?topicName="+$scope.topicName).then(function response(response){
//                                    var x = (new Date()).getTime(), // current time
//                                        y = parseInt(response.data);
//                                    series.addPoint([x, y], true, true);
//                             })
//                             }, 2000);
                        },
                        selection: function(event) {
//                             console.log("AAAA ", "christina")

                        // log the min and max of the primary, datetime x-axis
    //                   	console.log(
    //                   		Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', event.xAxis[0].min),
    //                   		Highcharts.dateFormat('%Y-%m-%d %H:%M:%S', event.xAxis[0].max)
    //                   	);
                        // log the min and max of the y axis
    //                   	console.log("AAAA ", event.yAxis[0].min, event.yAxis[0].max);

//                            var e=this.xAxis[0].getExtremes();
//                            console.log('AAAACCC x: \n      Min: ' + Highcharts.dateFormat(null, e.min) + ', Max: ' + Highcharts.dateFormat(null, e.max)
//                                  + '\n, dataMin: ' + Highcharts.dateFormat(null, e.dataMin) + ', dataMax: ' + Highcharts.dateFormat(null, e.dataMax)
//                                  + '\n, userMin: ' + Highcharts.dateFormat(null, e.userMin) + ', userMax: ' + Highcharts.dateFormat(null, e.userMax));

//                          var extremesy=this.yAxis[0].getExtremes();
//                          console.log('AAAA y: Min: '
////                                + extremesy.min + ', Max: ' + extremesy.max
//                                + ', dataMin: ' + Highcharts.dateFormat(null, e.dataMin) + ', dataMax: ' + extremesy.dataMax);
////                                + ', userMin: ' + extremesy.userMin + ', userMax: ' + extremesy.userMax);
//
//                            console.log("AA"  +'\n yAxis (Topics Counter)'
//                                       +'\n (' + this.yAxis[0].getExtremes().dataMin + ',' + this.yAxis[0].getExtremes().dataMax + ')');

                       }
                    },
                },

                rangeSelector: {

                    buttons: [{
                        type: 'day',
                        count: 1,
                        text: '24h'
                    }, {
                        type: 'day',
                        count: 3,
                        text: '3d'
                    }, {
                        type: 'week',
                        count: 1,
                        text: '1w'
                    }, {
                      type: 'month',
                      count: 1,
                      text: '1m'
                  }, {
                        type: 'month',
                        count: 6,
                        text: '6m'
                    }, {
                        type: 'year',
                        count: 1,
                        text: '1y'
                    }, {
                        type: 'all',
                        text: 'All'
                    }],
                    selected: 1
                },

                 credits: {
                      enabled: false
                  },

               legend: {
                        enabled: true
                        //,
//                        align: 'right',
//                        backgroundColor: '#FCFFC5',
//                        borderColor: 'black',
//                        borderWidth: 2,
//                        layout: 'vertical',
//                        verticalAlign: 'top',
//                        y: 100,
//                        shadow: true
                    },

                yAxis: {
                    title: {
                        text: 'Number of Messages'
                    }

                },

                 xAxis: {
                    events: {
                        setExtremes: function (e) {
                            var chartSelection = "Selected Min: " + Highcharts.dateFormat(null, e.min) + ' / Selected Max: '+ Highcharts.dateFormat(null, e.max);
                            $scope.chartSelection = chartSelection;
                            console.log(chartSelection);
                        }
                    }
                 },

                title: {
                    text: 'Messages in ' + $scope.topicName
                },

                subtitle: {
                    text: '' // dummy text to reserve space for dynamic subtitle
                },

//                    navigator: {
//                            height: 80
//                        },

                series: [

                 {
                    name: 'Rate',
                    type: 'column',
                    color: "#cccccc",
                    data: yAxisRate,
                    pointStart: response.data.pointStart,
                    pointInterval: response.data.pointInterval,
                    tooltip: {
                        valueDecimals: 0,
                        valueSuffix: ' messages/sec'
                    }
                    } , {
                    name: 'Messages',
//                    type: 'column',
                    color: "#000000",
                    data: yAxisMessagesCounts,
                    pointStart: response.data.pointStart,
                    pointInterval: response.data.pointInterval,
                    tooltip: {
                        valueDecimals: 0,
                        valueSuffix: ' messages'
                    }
                    },

//                     {
//                    name: 'Partition 1',
////                    type: 'column',
////                    color: "#000000",
//                    data: yAxisMessagesCounts,
//                    pointStart: response.data.pointStart,
//                    pointInterval: response.data.pointInterval,
//                    tooltip: {
//                        valueDecimals: 0,
//                        valueSuffix: ' messages'
//                    },
//                    showCheckbox: true,
//                    showInNavigator: false
//                    }
//
//                    ,
//
//                     {
//                    name: 'Partition 2',
////                    type: 'column',
////                    color: "#000000",
//                    data: yAxisMessagesCounts,
//                    pointStart: response.data.pointStart,
//                    pointInterval: response.data.pointInterval,
//                    tooltip: {
//                        valueDecimals: 0,
//                        valueSuffix: ' messages'
//                    }
//                    }

//                }
//                ,
//                {
//                    name: 'Offset',
//                    data: yAxisOffset,
//                    yAxis: 1,
//                    pointStart: response.data.pointStart,
//                    pointInterval: response.data.pointInterval,
//                    tooltip: {
//                        valueDecimals: 0,
//                        valueSuffix: ''
//                    }
//                }
                ]

            };



            Highcharts.StockChart({
                                                  chart : {
                                                      renderTo : 'container2',
                                                      padding : 0
                                                  },
                                                   credits: {
                                                        enabled: false
                                                    },
                                                  exporting: { enabled: false },
                                                  rangeSelector : {
                                                      enabled: false
                                                  },
                                                  tooltip : {
                                                      enabled: false
                                                  },
                                                  title : {
                                                      text : ''
                                                  },
//                                                  navigator: {
//                                                      height: 80
//                                                  },

                                                navigator: {
                                                          outlineColor: '#E4E4E4',
                                                          height: 80
                                                        },

                                                         scrollbar: {
                                                                  enabled: false
                                                                },
//                                                   scrollbar: {
//                                                      barBackgroundColor: 'gray',
//                                                      barBorderRadius: 7,
//                                                      barBorderWidth: 0,
//                                                      buttonBackgroundColor: 'gray',
//                                                      buttonBorderWidth: 0,
//                                                      buttonBorderRadius: 7,
//                                                      trackBackgroundColor: 'none',
//                                                      trackBorderWidth: 1,
//                                                      trackBorderRadius: 8,
//                                                      trackBorderColor: '#CCC'
//                                                  },
                                                  yAxis: {
                                                      height: 0,
                                                      gridLineWidth: 0,
                                                      labels: {
                                                          enabled: false
                                                      }
                                                  },
                                                  xAxis: {
                                                      lineWidth: 0,
                                                      tickLength : 0,
                                                      labels: {
                                                          enabled: false
                                                      }
                                                  },
                                                  series : [{
                                                      name : '',
                                                      lineWidth: 0,
                                                      marker: {
                                                          enabled: false,
                                                          states: {
                                                              hover: {
                                                                  enabled: false
                                                              }
                                                          }
                                                      },
                                                      data : yAxisMessagesCounts,
                                                      tooltip: {
                                                          valueDecimals: 2
                                                      }
                                                  }]
                                              });


            Highcharts.stockChart('container', chart)
            //);



 })


});
