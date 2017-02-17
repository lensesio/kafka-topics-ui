angularAPP.controller('ViewTopicCtrl', function ($scope, $routeParams, $log, $location, $http, TopicFactory, charts, $q, $timeout ) {

  $log.info("Starting kafka-topics controller : view ( topic = " + $routeParams.topicName + " )");

  var topicName = $routeParams.topicName;
  var selectedTabIndex = $routeParams.selectedTabIndex;
  var topicCategoryUrl = $routeParams.topicCategoryUrl;
  var topicMenuItem = $routeParams.menuItem;

  $scope.showSpinner = true;

  //TODO add error messages for failed requrests + false spinner
  TopicFactory.getTopicSummary(topicName, $scope.cluster.KAFKA_BACKEND)
  .then(function success(topic){
        $scope.topic = topic;
        TopicFactory.getTopicData(topicName, $scope.cluster.KAFKA_BACKEND).then(function success(allData){
          setTopicMessages(allData, $scope.topic.valueType)
     });
  })
  .then(function () {
     TopicFactory.getChartData(topicName, $scope.cluster.KAFKA_BACKEND).then(function response(response){
//           charts.getFullChart(topicName, response);
//            charts.getSpiderChart(topicName, response)
//              charts.getTreeChart(topicName, $scope.topic.messagesPerPartition)
//            charts.samplePartition();

        $scope.chartData = [
          ['partition','Parent','messages', 'messages'],
          [topicName + ' partitions',null,0,0]
        ];

        $scope.chartObject = {};

        angular.forEach ($scope.topic.messagesPerPartition, function (partition){
          $scope.chartData.push([partition.partition+'',topicName + ' partitions',partition.messages,partition.messages])
        })

        $scope.chartObject.type = "TreeMap";
        var data =$scope.chartData;

        $scope.chartObject.data = data;
        $scope.chartObject.options = {
         headerColor: '#F5F5F5',
         minColor: '#FEFEFF',
         midColor: '#8BAED0',
         maxColor: '#7DB6EC',
         showScale: true,
         generateTooltip: showStaticTooltip
       };

        function showStaticTooltip(row, size, value) {
               return '<div style="background:#777; color:#fff; padding:10px; border-style:solid">' +
               'Messages: <b>' + size + '</b> <br>' +
               'Broker: <b> XXx.xx.xxx.xx</b><br>' +
               'Leader Broker: <b> XXx.xx.xxx.xx</b><br></div>';
        }

     });
  });

    TopicFactory.getAllTopics($scope.cluster.KAFKA_BACKEND)
    .then(function success(allTopics){
      $scope.allTopics = allTopics;
    });


/*******************************
 * topic-toolbar.html
********************************/

  $scope.showDownloadDiv = false;
  $scope.showList = true;

  $scope.toggleList = function () {
     $scope.showList = !$scope.showList;
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

/*******************************
 * AUTO COMPLETE
********************************/
  $scope.simulateQuery = false;

  $scope.querySearch = function querySearch (query) {
    var results = query ? $scope.allTopics.filter( createFilterFor(query) ) : $scope.allTopics,
        deferred;
    if ($scope.simulateQuery) {
      deferred = $q.defer();
      $timeout(function () { deferred.resolve( results ); }, Math.random() * 1000, false);
      return deferred.promise;
    } else {
      return results;
    }
  }
  $scope.goTo = function goTo (topic) {
   var urlType = (topic.isControlTopic == true) ? 'c' : 'n';
    $location.path ("cluster/"+ $scope.cluster.NAME + "/topic/" +  urlType + "/" + topic.topicName);
  }
  function createFilterFor(query) {
    var lowercaseQuery = angular.lowercase(query);

    return function filterFn(item) {
      return (item.topicName.indexOf(lowercaseQuery) === 0);
    };

  }

/*******************************
 * topic-configuration.html
********************************/

  $scope.showMoreDesc = [];

  $scope.toggleMoreDesc = function (index) {
      $scope.showMoreDesc[index] = !$scope.showMoreDesc[index];
  };

/*******************************
* topic-configuration.html
********************************/

//    $scope.abc = charts.samplePartition();


/*******************************
 * data-chart.html
********************************/

  $scope.showChart = true;

  $scope.toggleChart = function () {
     $scope.showChart = !$scope.showChart;
  }

  $scope.kcqlRequest = function() {
      if (!$scope.kcql) { $scope.kcql='SELECT * FROM ' + topicName }
      var kcqlQuery = $scope.kcql.split(' ').join('+');
      $http.get("http://fast-data-backend.demo.landoop.com/api/rest/topics/kcql?query="+kcqlQuery).
      then(function response(response){
        $log.info('KCQL Responce: ',response)
      });
  } //tODO hardcoded!

/*******************************
 * topic data / Tabs handling
********************************/

  $scope.selectedTabNnumber = setSelectedDataTab(selectedTabIndex);

  function setSelectedDataTab(selectedTabIndex) {
    switch(selectedTabIndex) {
        case "topic": return 0;
        case "table": return 1;
        case "rawdata": return 2;
        default: return 0;
    }
  }

  $scope.selectedMenuItem = (topicMenuItem != undefined) ? topicMenuItem : 'overview';

  $scope.setMenuSelection = function(currentMenuItem, cluster) {
        $scope.selectedMenuItem = currentMenuItem;
        $location.path("cluster/"+ cluster.NAME + "/topic/" +  topicCategoryUrl + "/" + topicName + "/" + currentMenuItem, false);
  }

  $scope.onTabChanges = function(currentTabIndex, cluster){
      $location.path ("cluster/"+ cluster.NAME + "/topic/" +  topicCategoryUrl + "/" + topicName +  "/" + $scope.selectedMenuItem + "/" + currentTabIndex, false);
  };

/*******************************
 * still Depends on Kafka Rest
********************************/

  /****************** SUPER CLEAN UP REQUIRED HERE / STARTS (this is the only dep to KAFKA_REST) *****************/
  //If data is empty don't try to deserialize

  function setTopicMessages(allData, topicType) {
     $scope.rows = allData;
     angular.forEach($scope.rows, function (row) {
       if($scope.topic.valueType=='avro' || $scope.topic.valueType=='json'  ){
       row.value=JSON.parse(row.value)
       }
       if($scope.topic.keyType=='avro' || $scope.topic.keyType=='json'  ){
       row.key=JSON.parse(row.key)
       }
     })
     $scope.showSpinner = false;
  }

  function getDeserializationErrorMessage(reason, type) {
      return $log.debug('Failed with '+ type +' type :(  (' + reason + ')');
  }

  /****************** SUPER CLEAN UP REQUIRED HERE / ENDS *****************/


      //MOCKING

  //      var mockedTopic = {
  //
  //            keyType : "empty",
  //            valueType : "avro",
  //            totalMessages : 1,
  //            replication : 1,
  //            topicName : "yahoo-fx",
  //            isControlTopic: false,
  //            customConfig : [
  //              {
  //                configuration: "cleanup.policy",
  //                value : "compact",
  //                defaultValue : "delete",
  //                documentation : "A string that is either \"delete\" or \"compact\". This string designates the retention policy to use on old log segments. The default policy (\"delete\") will discard old segments when their retention time or size limit has been reached. The \"compact\" setting will enable log compaction on the topic."
  //              }
  //            ],
  //            partitions : 1,
  //            isControlTopic : true,
  //            messagesPerPartition : [ ]
  //          }
  //      $scope.topic = mockedTopic;


});

angularAPP.factory('TopicFactory', function (HttpFactory) {
    return {
          getTopicSummary: function (topicName, endpoint) {
             return HttpFactory.req('GET', endpoint  + '/topics/summary/' + topicName);
          },
          getTopicData: function (topicName,  endpoint) {
             return HttpFactory.req('GET', endpoint  + '/topics/data/' + topicName);
          },
          getChartData: function(topicName, endpoint) {
            return HttpFactory.req('GET', endpoint + "/topics/chart/"+ topicName)
          },
          getAllTopics: function(endpoint) {
            return HttpFactory.req('GET', endpoint + "/topics/summaries")
          }
    }
});
