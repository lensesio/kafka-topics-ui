angularAPP.controller('ViewTopicCtrl', function ($scope, $routeParams, $log, $location, $http, TopicFactory, $q, $timeout ) {

  $log.info("Starting kafka-topics controller : view ( topic = " + $routeParams.topicName + " )");

  var topicName = $routeParams.topicName;
  var selectedTabIndex = $routeParams.selectedTabIndex;
  var topicCategoryUrl = $routeParams.topicCategoryUrl;
  var topicMenuItem = $routeParams.menuItem;

  $scope.showSpinner = true;

  //TODO add error messages for failed requrests + false spinner
  TopicFactory.getTopicSummary(topicName, $scope.cluster.KAFKA_REST)
  .then(function success(topic){
        topic.configs = makeConfigsArray(topic.configs);

        $scope.topic = topic;

        //TODO get Data from consumer
//        TopicFactory.getTopicData(topicName, $scope.cluster.KAFKA_REST)
//            .then(function success(allData){
//              console.log("abc",allData)
//              setTopicMessages(allData, $scope.topic.valueType)
//            });
        //MOCKING HERE
        setTopicMessages(TopicFactory.getTopicData(topicName, $scope.cluster.KAFKA_REST))
  });


    TopicFactory.getAllTopics($scope.cluster.KAFKA_REST)
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
 * topic-overview.html / partition
********************************/



/*******************************
 * topic-configuration.html
********************************/

  $scope.showMoreDesc = [];

  $scope.toggleMoreDesc = function (index) {
      $scope.showMoreDesc[index] = !$scope.showMoreDesc[index];
  };

  function makeConfigsArray(configs) {
//    configs = {"segment.bytes":"104857600","cleanup.policy":"compact","compression.type":"producer"};
    var configArray = [];
    angular.forEach(configs, function(value, key) {
          var object = {
            configuration : key,
            value : value,
            defaultValue : "abc",
            documentation : "defsdsdsdsdsd"
          };
          this.push(object);
    }, configArray);
    return configArray;
  }

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
     //TODO check
//     angular.forEach($scope.rows, function (row) {
//       if($scope.topic.valueType=='avro' || $scope.topic.valueType=='json'  ){
//       row.value=JSON.parse(row.value)
//       }
//       if($scope.topic.keyType=='avro' || $scope.topic.keyType=='json'  ){
//       row.key=JSON.parse(row.key)
//       }
//     })
     $scope.showSpinner = false;
  }

  function getDeserializationErrorMessage(reason, type) {
      return $log.debug('Failed with '+ type +' type :(  (' + reason + ')');
  }

});

angularAPP.factory('TopicFactory', function (HttpFactory) {
    return {
          getTopicSummary: function (topicName, endpoint) {
             return HttpFactory.req('GET', endpoint  + '/topics/' + topicName);
          },
          getTopicData: function (topicName,  endpoint) {
               var a =  {
                        	"key": "1",
                        	"value": {
                        		"Type": 1
                        	},
                        	"partition": 0,
                        	"offset": 3307068020
                        };
               var b = [];
               b.push(a);
               return b;
               //TODO BRING THE DATA!!!!!!
//             return HttpFactory.req('GET', endpoint  + '/topics/' + topicName);
          },
          getAllTopics: function(endpoint) {
            return HttpFactory.req('GET', endpoint + "/topics")
          }
    }
});
