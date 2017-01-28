//TODO CLEAN ME UP!!!!!!!!!

angularAPP.controller('ViewTopicCtrl', function ($scope, $rootScope, $filter, $routeParams, $log, $mdToast, $location, $mdDialog, $http, KafkaRestProxyFactory, UtilsFactory, HttpFactory, charts, env) {

  $log.info("Starting kafka-topics controller : view ( topic = " + $routeParams.topicName + " )");

  //Init state
  $scope.topicName = $routeParams.topicName;
  $scope.showSpinner = true;
  $scope.showDownloadDiv = false;
  $scope.showList = true;
  $scope.showMoreDesc = [];

  $mdToast.hide(); // ?
  $scope.topicCategoryUrl = $routeParams.topicCategoryUrl;
//  $rootScope.topicCategoryUrl = $routeParams.topicCategoryUrl;
  $scope.selectedTabNnumber = setSelectedDataTab($routeParams.selectedTabIndex);
  $scope.topicType = KafkaRestProxyFactory.getDataType($scope.topicName);

    HttpFactory.getTopicSummary($scope.topicName).then(function (topicMetadata){
        $scope.topicMetadata = topicMetadata;
    });

    $http.get(env.KAFKA_BACKEND()+ "/topics/chart/"+ $scope.topicName) //TODO
        .then(function response(response){
              charts.getFullChart($scope.topicName, response);
//              charts.getTimeChart($scope.topicName, response);
        });

   $scope.toggleList = function () {
      $scope.showList = !$scope.showList;
   };

//  $scope.$on('$routeChangeSuccess', function() {
//    $scope.cluster = env.getSelectedCluster();//$routeParams.cluster;
//  })

  $scope.onTabChanges = function(currentTabIndex){
    $location.path ("cluster/"+ $rootScope.cluster.NAME + "/topic/" +  $scope.topicCategoryUrl + "/" + $scope.topicName + "/" + currentTabIndex, false);
  };


   $scope.ToggleMoreDesc = function (index) {
      $scope.showMoreDesc[index] = !$scope.showMoreDesc[index];
   };

  $scope.aceLoaded = function (_editor) {
    $scope.editor = _editor;
    $scope.editor.$blockScrolling = Infinity;
    _editor.setOptions({
      minLines: 33,
      maxLines: 33
    });
  };

  $scope.downloadData = function (topicName) {
    $log.info("Download requested for " + $scope.aceString.length + " bytes ");
    var json = $scope.aceString;
    var blob = new Blob([json], {type: "application/json;charset=utf-8;"});
    var downloadLink = angular.element('<a></a>');
    downloadLink.attr('href', window.URL.createObjectURL(blob));
    downloadLink.attr('download', topicName + '.json');
    downloadLink[0].click();
  };

  function setCustomMessage(rows) {
    var totalRows = 0;
//    if ($scope.topicName == "_schemas") {
//      totalRows = rows.length;
//      $scope.customMessage = "Topic <b>_schemas</b> holds <b>" + totalRows + "</b> registered schemas for the schema-registry"
//    } else if ($scope.topicName == "connect-configs") {
//      totalRows = rows.length;
//      $scope.customMessage = "Topic <b>connect-configs</b> holds <b>" + $scope.getConnectors(rows, 'connector-').length + "</b> connector configurations" +
//        " and <b>" + $scope.getConnectors(rows, 'task-').length + "</b> task configurations";
//    } else if ($scope.topicName == "connect-offsets") {
//      totalRows = rows.length;
//      $scope.customMessage = "Topic <b>connect-offsets</b> holds the offsets of your connectors. Displaying <b>" + totalRows + "</b> rows";
//    } else if ($scope.topicName == "connect-status") {
//      totalRows = rows.length;
//      // $scope.customMessage = "Topic <b>connect-status</b> holds <b>" + $scope.getCompactedConnectStatus(rows, 'RUNNING').length + "</b> RUNNING connectors";
//      $scope.customMessage = "";
//    } else {
      if (UtilsFactory.IsJsonString(rows)) {
        totalRows = JSON.parse(rows).length;
        $scope.customMessage = "Displaying " + totalRows + " rows ";// + KafkaRestProxyFactory.bytesToSize(rows.length);
      } else {
        totalRows = rows.length;
        $scope.customMessage = "Displaying " + totalRows + " rows ";// + KafkaRestProxyFactory.bytesToSize(rows.length);
      }
//    }
    $scope.topicIsEmpty = totalRows == 0;

    $scope.topicData = rows; //TODO removeme
    return totalRows;
  }


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

  $scope.isNormalTopic = function (topicName) {
    return ['_schemas', 'connect-status'].indexOf(topicName) == -1;
  };

  $scope.isControlTopic = function(topicName) {
     return !KafkaRestProxyFactory.isNormalTopic(topicName);
  };

  // At start-up this controller consumes data
  //TODO
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
                            "value" : 'value' +  row.value
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
      if (!$scope.kcql) { $scope.kcql='SELECT * FROM ' +$scope.topicName }
      var kcqlQuery = $scope.kcql.split(' ').join('+');
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





function setSelectedDataTab(selectedTabIndex) {
    switch(selectedTabIndex) {
        case "topic": return 0;
        case "table": return 1;
        case "rawdata": return 2;
        default: return 0;
    }
}





$scope.allCols = [
 {id: "offset", label: "offset"},
 {id: "partition", label: "partition"},
 {id: "key", label: "key"},
 {id: "value", label: "value"}];

  $scope.selectedCols = {};

  $scope.checkAndHide = function checkAndHide(name) {
    if ($scope.selectedCols.searchText){
        var showCol = $scope.selectedCols.searchText.some(function (selectedCols) {
          return selectedCols === name;
        });
        return showCol
    }
  }

  $scope.addColumnClass = function (columnIndex) {
      columnIndex = columnIndex + 1;
      var columnClass = '';
      if (columnIndex == 1 ) {columnClass='offset'}
      else if(columnIndex == 2) {columnClass='partition'}
      else if(columnIndex < 4 + $scope.cols3.length ) {columnClass='key'}
      else if(columnIndex < 5 + $scope.cols3.length  + $scope.cols2.length ) {columnClass='value'}
      return columnClass;
  }


});
