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
  $scope.selectedTabNnumber = setSelectedDataTab($routeParams.selectedTabIndex);
  $scope.topicType = KafkaRestProxyFactory.getDataType($scope.topicName);

    HttpFactory.getTopicSummary($scope.topicName).then(function (topicMetadata){
        $scope.topicMetadata = topicMetadata;
        //      $scope.partitions = metaData.partitions.length; //TODO
        //      $scope.getPartitions = function(num) {
        //        return Array.apply(null, {length: num}).map(Number.call, Number)
        //      }
    });

   $scope.toggleList = function () {
      $scope.showList = !$scope.showList;
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

  $scope.kcqlRequest = function() {
        if (!$scope.kcql) { $scope.kcql='SELECT * FROM ' +$scope.topicName }
        var kcqlQuery = $scope.kcql.split(' ').join('+');
        $http.get("http://fast-data-backend.demo.landoop.com/api/rest/topics/kcql?query="+kcqlQuery).then(function response(response){
          $log.info('KCQL Responce: ',response)
        });
    } //tODO hardcoded!

//  $scope.$on('$routeChangeSuccess', function() {
//    $scope.cluster = env.getSelectedCluster();//$routeParams.cluster;
//  })

  $scope.onTabChanges = function(currentTabIndex){
    $location.path ("cluster/"+ $rootScope.cluster.NAME + "/topic/" +  $scope.topicCategoryUrl + "/" + $scope.topicName + "/" + currentTabIndex, false);
  };

  $scope.isNormalTopic = function (topicName) {
    return ['_schemas', 'connect-status'].indexOf(topicName) == -1;
  };

  $scope.isControlTopic = function(topicName) {
     return !KafkaRestProxyFactory.isNormalTopic(topicName);
  };

/****************** SUPER CLEAN UP REQUIRED HERE / STARTS (this is the only dep to KAFKA_REST) *****************/
  if (($scope.topicType == "json") || ($scope.topicType == "binary") || ($scope.topicType == "avro")) {
    KafkaRestProxyFactory.consumeKafkaRest($scope.topicType, $scope.topicName).then(function (allData) {
      setDataState(allData, $scope.topicType);
    }, function (error) { getDeserializationErrorMessage(error, $scope.topicType); });
  } else {
    // If we don't know we need to guess by trying Avro -> JSon -> Binary
    KafkaRestProxyFactory.consumeKafkaRest("avro", $scope.topicName).then(
       function (allData) {
          if (JSON.stringify(allData).indexOf("error") > 0) {
            KafkaRestProxyFactory.consumeKafkaRest("json", $scope.topicName).then(
                function (allData) {
                    if (JSON.stringify(allData).indexOf("error_code") > 0) {
                      KafkaRestProxyFactory.consumeKafkaRest("binary", $scope.topicName).then(
                        function (allData) { setDataState(allData, 'binary'); },
                        function (error) { getDeserializationErrorMessage(error, 'binary') });
                    } else {
                      setDataState(allData, 'json');
                    }
              }, function (error) { getDeserializationErrorMessage(error, 'json') });
          } else {
            setDataState(allData,'avro')
          }
    }, function (error) { getDeserializationErrorMessage(error, 'avro') });
  }

/****************** SUPER CLEAN UP REQUIRED HERE / ENDS *****************/

/*******************************
 *
 * topic-configuration.html
 *
********************************/

   $scope.ToggleMoreDesc = function (index) {
      $scope.showMoreDesc[index] = !$scope.showMoreDesc[index];
   };


/*******************************
 *
 * data-chart.html
 *
********************************/

     $http.get(env.KAFKA_BACKEND()+ "/topics/chart/"+ $scope.topicName) //TODO
           .then(function response(response){
                  charts.getFullChart($scope.topicName, response);
           });

    $scope.showChart = true;

    $scope.toggleChart = function () {
        $scope.showChart = !$scope.showChart;
    }

/*******************************
 *
 * data-tree-view.html
 *
********************************/

 $scope.showTree = function (keyOrValue) {
    return !(angular.isNumber(keyOrValue) || angular.isString(keyOrValue) || (keyOrValue==null));
 }


/*******************************
 *
 * data-flatten-view.html
 *
********************************/

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
    //TODO ??? Same name??
    // This one is called each time - the user clicks on an md-table header (applies sorting)
    $scope.logOrder = function (a) {
      $log.info("Ordering event " + a);
      sortSchema(a);
    };


//    $scope.tableOptions = {  //TODO used?
//      rowSelection: false,
//      multiSelect: false,
//      autoSelect: false,
//      decapitate: false,
//      largeEditDialog: false,
//      boundaryLinks: false,
//      limitSelect: true,
//      pageSelect: true
//    };

/*******************************
 *
 * various private methods / to organise
 *
********************************/

  function setSelectedDataTab(selectedTabIndex) {
      switch(selectedTabIndex) {
          case "topic": return 0;
          case "table": return 1;
          case "rawdata": return 2;
          default: return 0;
      }
  }

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

  function setDataState(allData,topicType) {
        (topicType == 'json') ? $scope.aceString = allData :$scope.aceString = angular.toJson(allData, true);
        $scope.rows = allData;
        $scope.topicIsEmpty = allData.length == 0;
        flattenTable(allData);
        $scope.showSpinner = false;
  }

  function getDeserializationErrorMessage(reason, type) {
      return 'Failed with '+ type +' type :(  (' + reason + ')';
  }

});
