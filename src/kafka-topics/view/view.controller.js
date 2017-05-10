angularAPP.controller('ViewTopicCtrl', function ($scope, $routeParams, $rootScope, $filter, $log, $location,$cookies, $http, $base64, TopicFactory, env, $q, $timeout , consumerFactory, HttpFactory) {

  $log.debug($routeParams.topicName, "Starting [ViewTopicCtrl]");

  var topicName = $routeParams.topicName;
  var selectedTabIndex = $routeParams.selectedTabIndex;
  var topicCategoryUrl = $routeParams.topicCategoryUrl;
  var topicMenuItem = $routeParams.menuItem;

  $scope.showSpinner = true;
  $scope.showInnerSpinner = false ;

      //TODO add error messages for failed requrests + false spinner
      TopicFactory.getTopicSummary(topicName, $scope.cluster.KAFKA_REST)
      .then(function success(topic){
            topic.data.configs = makeConfigsArray(topic.data.configs);
            $scope.topic = topic.data;
            if($scope.topic.partitions.length == 1) {
              $scope.selectedPartition = '0'
              $scope.disableAllPartitionsOption = true;
            }

            $scope.showAdvanced = ($scope.topic.partitions.length == 1 ? true : false )
            $scope.disableAllPartitionButtons = ($scope.topic.partitions.length == 1 ? true : false )
      },
     function failure(responseError2) {
     });

    TopicFactory.getAllTopics($scope.cluster.KAFKA_REST) //TODO do we need this?
    .then(function success(allTopics){
      $scope.allTopics = allTopics;
    });

  $scope.disableAllPartitionButtons = false;

/*******************************
 * topic-toolbar.html
********************************/

  $scope.showDownloadDiv = false;

  $scope.toggleList = function () {
     $rootScope.showList = !$rootScope.showList;
  };
  $scope.refreshDataForDownload = function(searchFilter){
      $scope.dataForDownload = $filter('filter')($scope.rows, searchFilter)
  }

  $scope.downloadData = function (topicName) {
    $log.info("Download requested for " + $scope.dataForDownload.length + " bytes ");
    var json = JSON.stringify($scope.dataForDownload);
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

  function makeConfigsArray(configs) {
//    configs = {"segment.bytes":"104857600","cleanup.policy":"compact","compression.type":"producer"};
    var configArray = [];

    angular.forEach(configs, function(value, key) {
          var object = {
            configuration : key,
            value : value,
            defaultValue : getDefaultConfigValue(key),
            documentation : getConfigDescription(key)
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

  $scope.selectedMenuItem = (topicMenuItem != undefined) ? topicMenuItem : 'data';

  $scope.setMenuSelection = function(currentMenuItem, cluster) {
        $scope.selectedMenuItem = currentMenuItem;
        $location.path("cluster/"+ cluster.NAME + "/topic/" +  topicCategoryUrl + "/" + topicName + "/" + currentMenuItem, false);
  }

  $scope.onTabChanges = function(currentTabIndex, cluster){
      $location.path ("cluster/"+ cluster.NAME + "/topic/" +  topicCategoryUrl + "/" + topicName +  "/" + $scope.selectedMenuItem + "/" + currentTabIndex, false);
  };

  $scope.maxHeight = window.innerHeight - 300;
  if ($scope.maxHeight < 310) {$scope.maxHeight = 310}

/*******************************
 * DATA stuff
********************************/
   $scope.partitionIsEmpty = false;
   $scope.seekToEnd = false;
   $scope.selectedPartition = "-1";

  function setTopicMessages(allData, format, forPartition) {
    if(forPartition) {
        $scope.showAdvanced = true;
        $scope.disableAllPartitionButtons = true;
        if(allData.length === 0) $scope.partitionIsEmpty = true;
    }
     $scope.rows = allData;
     $scope.format=format;
     $scope.dataForDownload = $scope.rows

     if(format == 'binary'){
       angular.forEach($scope.rows, function(row){
          row.key=$base64.decode(row.key)
          row.value=$base64.decode(row.value)
       })
      $scope.dataForDownload = $scope.rows
     }
     $scope.showSpinner = false;

    if(allData.length > 0) {

     var floor = $scope.firstOffsetForPartition ? $scope.firstOffsetForPartition : allData[0].offset;
     }
  }

  function getDeserializationErrorMessage(reason, type) {
      return $log.debug('Failed with '+ type +' type :(  (' + reason + ')');
  }

  createAndFetch(consumerFactory.getConsumerType(topicName), topicName);
  $scope.hideTab = false;

  function createAndFetch(format, topicName) {
    $scope.showInnerSpinner = true;
    $log.debug("... DATA FOR PARTITION [ ALL ]...");
    $scope.uuid = consumerFactory.genUUID();
    consumerFactory
        .createConsumer(format, topicName, $scope.uuid)
        .then(function(res){
            return consumerFactory.getConsumer(format, $scope.uuid);
        })
        .then(function(consumer) {
            consumerFactory.getDataFromBeginning(consumer, format, topicName).then(function (allData) {
                if(allData === -1) {
                    $log.debug(topicName, "FAILED TO GET DATA, NEED TO RETRY", allData, consumer, topicName);
                    createAndFetch(consumerFactory.getConsumerTypeRetry(format, topicName), topicName);
                    $scope.showInnerSpinner = false;
                } else {
                    $log.debug(topicName, "GOT DATA, WILL RENDER", " [", allData.data.length, "] [", format, "] MESSAGES");
                    setTopicMessages(allData.data, format, false)
                    $scope.showInnerSpinner = false;
                    $scope.seekToEnd = false;
                }
            });
        });
  }
    function createAndFetchFromEnd(format, topicName) {
    $scope.showInnerSpinner = true;
    $log.debug("... DATA FOR PARTITION [ ALL ]...");
    $scope.uuid = consumerFactory.genUUID();
    consumerFactory
        .createConsumer(format, topicName, $scope.uuid)
        .then(function(res){
            return consumerFactory.getConsumer(format, $scope.uuid);
        })
        .then(function(consumer) {
            consumerFactory.getDataFromEnd(consumer, format, topicName).then(function (allData) {
                if(allData === -1) {
                    $log.debug(topicName, "FAILED TO GET DATA, NEED TO RETRY", allData, consumer, topicName);
                    createAndFetchFromEnd(consumerFactory.getConsumerTypeRetry(format, topicName), topicName);
                    $scope.showInnerSpinner = false;
                } else {
                    $log.debug(topicName, "GOT DATA, WILL RENDER", " [", allData.data.length, "] [", format, "] MESSAGES");
                    setTopicMessages(allData.data, format, false)
                    $scope.showInnerSpinner = false;
                    $scope.seekToEnd = true;
                }
            });
        });
  }

  $scope.createAndFetchFromEnd = function(format, topicName) {
    createAndFetchFromEnd(format, topicName)
  }
  $scope.createAndFetch = function(format, topicName) {
    createAndFetch(format, topicName)
  }
  $scope.selectedOffset = {offset: 0}

  $scope.assignPartitions = function assignPartitions(partition, offset, position, firstTime) {
    $scope.selectedPartition = partition;
    $scope.showInnerSpinner = true

    $log.debug("... DATA FOR PARTITION [" + partition + "]...", position);
    var format = consumerFactory.getConsumerType(topicName);//$scope.format; //TODO

    //TODO If partitions = all (somehow) then createAndFetch
    if(partition == -1) {
        $scope.showAdvanced = false;
        $scope.disableAllPartitionButtons = false;
        createAndFetch(format, topicName);
        return;
    }

    if(position=='end'){
      $scope.seekToEnd=true;
    } else {
      $scope.seekToEnd=false;
    }


    //TODO make a loading for data only for the case partition is empty// $scope.showSpinner = true;
    var partition = [ { "partition" : partition } ]; //create array because assignments works for all too.

    offset = parseInt(offset);
    if (!angular.isDefined(offset)){offset = 1}
    $scope.selectedOffset.offset=offset;
    $scope.uuid = consumerFactory.genUUID();

    consumerFactory
        .createConsumer(format, topicName, $scope.uuid)
        .then(function(res){
            return consumerFactory.getConsumer(format, $scope.uuid);
        })
        .then(function(consumer) {
            $log.debug(topicName, "1) GOT PARTITION", partition);
            consumerFactory.getDataForPartition(topicName, consumer, format, partition, offset, position)
            .then(function(allData) {
                if(allData !== -1) {
                    if(firstTime && allData.data.length !== 0) { $scope.firstOffsetForPartition = allData.data[0].offset }
                    setTopicMessages(allData.data, format, true);
                    $scope.showInnerSpinner = false;

                } else {
                    $scope.cannotGetDataForPartition = "Cannot get data for partition [" + partitions + "]. Please refresh."
                    $scope.showInnerSpinner = false;
                }
            });
        });
  }

  function getDefaultConfigValue(configKey) {
    var defaultConfigValue = "";
    angular.forEach(KAFKA_DEFAULTS, function (kafkaDefault) {
      if (kafkaDefault.property == configKey) {
        defaultConfigValue = kafkaDefault.default;
      }
    });
    return defaultConfigValue;
  };

  function getConfigDescription(configKey) {
    var configDescription = "";
    angular.forEach(KAFKA_DEFAULTS, function (kafkaDefault) {
      if (kafkaDefault.property == configKey) {
        configDescription = kafkaDefault.description;
      }
    });
    return configDescription;
  };

});

angularAPP.factory('TopicFactory', function (HttpFactory) {
    var defaultContentType = 'application/vnd.kafka.avro.v2+json';

    return {
          getTopicSummary: function (topicName, endpoint) {
             return HttpFactory.req('GET', endpoint  + '/topics/' + topicName);
          },
          getAllTopics: function(endpoint) {
            return HttpFactory.req('GET', endpoint + "/topics")
          }
    }
});