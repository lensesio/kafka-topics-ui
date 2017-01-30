angularAPP.controller('ViewTopicCtrl', function ($scope, $rootScope, $filter, $routeParams, $log, $mdToast, $location, $mdDialog, $http, KafkaRestProxyFactory, UtilsFactory, HttpFactory, charts, env) {

  $log.info("Starting kafka-topics controller : view ( topic = " + $routeParams.topicName + " )");

  var topicName = $routeParams.topicName;
  var selectedTabIndex = $routeParams.selectedTabIndex
  var topicCategoryUrl = $routeParams.topicCategoryUrl;

    //MOCKING

      var mockedTopic = {

            keyType : "empty",
            valueType : "avro",
            totalMessages : 1,
            replication : 1,
            topicName : "yahoo-fx",
            isControlTopic: false,
            customConfig : [
              {
                configuration: "cleanup.policy",
                value : "compact",
                defaultValue : "delete",
                documentation : "A string that is either \"delete\" or \"compact\". This string designates the retention policy to use on old log segments. The default policy (\"delete\") will discard old segments when their retention time or size limit has been reached. The \"compact\" setting will enable log compaction on the topic."
              }
            ],
            partitions : 1,
            isControlTopic : true,
            messagesPerPartition : [ ]
          }
      $scope.topic = mockedTopic;

      //REAL
//    HttpFactory.getTopicSummary(topicName).then(function success(topic){
//        $scope.topic = topic;
//        //IF topic found / then get chart + data
//     $http.get(env.KAFKA_BACKEND()+ "/topics/chart/"+ topic.topicName) //TODO also put it in HttpFactory
//           .then(function response(response){
//                  charts.getFullChart(topicName, response);
//           });
//    }, function failure(error) { $scope.topic = {}; }); //TODO error message cannot get topic

  $scope.topicName = topicName;
  $scope.topicType = $scope.topic.valueType;//KafkaRestProxyFactory.getDataType($scope.topicName);

  //Init state
  $scope.showSpinner = true;
  $scope.showDownloadDiv = false;
  $scope.showList = true;
  $scope.showMoreDesc = [];
  $mdToast.hide(); // ?
  $scope.selectedTabNnumber = setSelectedDataTab(selectedTabIndex);
  $scope.paginationItems = 10;


  $scope.getPartitions = function(num) {
    return Array.apply(null, {length: num}).map(Number.call, Number)
  }

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

  $scope.downloadData = function (topicName, data) {
    $log.info("Download requested for " + data.length + " bytes ");
    var json = data;
    var blob = new Blob([json], {type: "application/json;charset=utf-8;"});
    var downloadLink = angular.element('<a></a>');
    downloadLink.attr('href', window.URL.createObjectURL(blob));
    downloadLink.attr('download', topicName + '.json');
    downloadLink[0].click();
  };

  $scope.kcqlRequest = function() {
        if (!$scope.kcql) { $scope.kcql='SELECT * FROM ' + topicName }
        var kcqlQuery = $scope.kcql.split(' ').join('+');
        $http.get("http://fast-data-backend.demo.landoop.com/api/rest/topics/kcql?query="+kcqlQuery).
        then(function response(response){
          $log.info('KCQL Responce: ',response)
        });
    } //tODO hardcoded!

  $scope.onTabChanges = function(currentTabIndex, cluster){
    $location.path ("cluster/"+ cluster.NAME + "/topic/" +  topicCategoryUrl + "/" + topicName + "/" + currentTabIndex, false);
  };

/****************** SUPER CLEAN UP REQUIRED HERE / STARTS (this is the only dep to KAFKA_REST) *****************/
//If data is empty don't try to deserialize

getTopicData(topicName, $scope.topic.valueType);

function getTopicData(topicName, topicType) {

      if ((topicType == "json") || (topicType == "binary") || (topicType == "avro")) {
        KafkaRestProxyFactory.consumeKafkaRest(topicType, topicName).then(function (allData) {
          setDataState(allData, topicType);
        }, function (error) { getDeserializationErrorMessage(error, topicType); });
      } else {
        // If we don't know we need to guess by trying Avro -> JSon -> Binary
        KafkaRestProxyFactory.consumeKafkaRest("avro", topicName).then(
           function (allData) {
              if (JSON.stringify(allData).indexOf("error") > 0) {
                KafkaRestProxyFactory.consumeKafkaRest("json", topicName).then(
                    function (allData) {
                        if (JSON.stringify(allData).indexOf("error_code") > 0) {
                          KafkaRestProxyFactory.consumeKafkaRest("binary", topicName).then(
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

}

/****************** SUPER CLEAN UP REQUIRED HERE / ENDS *****************/

/*******************************
 *
 * topic-configuration.html
 *
********************************/

   $scope.toggleMoreDesc = function (index) {
      $scope.showMoreDesc[index] = !$scope.showMoreDesc[index];
   };


/*******************************
 *
 * data-chart.html
 *
********************************/

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

  function setDataState(allData, topicType) {
        (topicType == 'json') ? $scope.aceString = allData :$scope.aceString = angular.toJson(allData, true);
        $scope.rows = allData;
        $scope.showSpinner = false;
  }

  function getDeserializationErrorMessage(reason, type) {
      return 'Failed with '+ type +' type :(  (' + reason + ')';
  }

});
