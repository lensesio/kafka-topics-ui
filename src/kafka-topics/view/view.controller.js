angularAPP.controller('ViewTopicCtrl', function ($scope, $routeParams, $rootScope, $filter, $log, $location,$cookies, $http, TopicFactory, $q, $timeout , consumerFactory, HttpFactory) {

  $log.info("Starting kafka-topics controller : view ( topic = " + $routeParams.topicName + " )");

  var topicName = $routeParams.topicName;
  var selectedTabIndex = $routeParams.selectedTabIndex;
  var topicCategoryUrl = $routeParams.topicCategoryUrl;
  var topicMenuItem = $routeParams.menuItem;

  $scope.showSpinner = true;


      //TODO add error messages for failed requrests + false spinner
      TopicFactory.getTopicSummary(topicName, $scope.cluster.KAFKA_REST)
      .then(function success(topic){
            topic.data.configs = makeConfigsArray(topic.data.configs);
            $scope.topic = topic.data;
      },
     function failure(responseError2) {
     });

    TopicFactory.getAllTopics($scope.cluster.KAFKA_REST)
    .then(function success(allTopics){
      $scope.allTopics = allTopics;
    });

  $scope.showOrHideAdvanced = 'Show advanced';
  $scope.showAdvanced = false;
  $scope.toggleAdvanced = function(){
  if($scope.showAdvanced)
    $scope.showOrHideAdvanced = 'Show advanced';
    else
    $scope.showOrHideAdvanced = 'Hide advanced';

    $scope.showAdvanced = !$scope.showAdvanced
  }
/*******************************
 * topic-toolbar.html
********************************/

  $scope.showDownloadDiv = false;

  $scope.toggleList = function () {
     $rootScope.showList = !$rootScope.showList;
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

  $scope.selectedMenuItem = (topicMenuItem != undefined) ? topicMenuItem : 'data';

  $scope.setMenuSelection = function(currentMenuItem, cluster) {
        $scope.selectedMenuItem = currentMenuItem;
        $location.path("cluster/"+ cluster.NAME + "/topic/" +  topicCategoryUrl + "/" + topicName + "/" + currentMenuItem, false);
  }

  $scope.onTabChanges = function(currentTabIndex, cluster){
      $location.path ("cluster/"+ cluster.NAME + "/topic/" +  topicCategoryUrl + "/" + topicName +  "/" + $scope.selectedMenuItem + "/" + currentTabIndex, false);
  };


  $scope.maxHeight = window.innerHeight - 215;
    if ($scope.maxHeight < 310) {$scope.maxHeight = 310}
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

  createAndFetch ('avro', topicName);

  function createAndFetch (format, topicName) {
    consumerFactory.createConsumers(format, topicName).then( function (response) {
      var uuid=$cookies.getAll().uuid;
        if (response.status == 409 || response.status == 200) {
          var consumer = {group :'kafka_topics_ui_'+format+'_' + uuid, instance: 'kafka-topics-ui-'+ format };
          $scope.consumer=consumer;
          consumerFactory.subscribeAndGetData(consumer, format, topicName).then(function (allData) {
            if ((allData.status == 500 || allData.data.error_code == 404 ) && format=='avro') {
              createAndFetch('json', topicName)
            }
            else if ((allData.status == 500 || allData.data.error_code == 404 ) && format=='json') {
              createAndFetch('binary', topicName)
            } else if (!(allData.status == 500 || allData.data.error_code == 404 )){

              console.log('Format is:', format)
              $scope.format=format;
              setTopicMessages(allData.data)
              $scope.showSpinner = false;
            } else {
            }
          })
          if (response.status == 409) {
              var msg = response.data.message;
              msg = "Conflict 409. " + msg;
              $log.warn(msg)
           }
         } else {
          $log.warn(response.data.message)
         }
    })
  }
    $scope.selectedPartitions = []
//    For select/deselect all partitions

//    $scope.isIndeterminate = function() {
//      return ($scope.selectedPartitions.length !== 0 &&
//          $scope.selectedPartitions.length !== $scope.topic.partitions.length);
//    };
//
//    $scope.isChecked = function() {
//      return $scope.selectedPartitions.length === $scope.topic.partitions.length;
//    };
//
//    $scope.toggleAll = function() {
//      if ($scope.selectedPartitions.length === $scope.topic.partitions.length) {
//        $scope.selectedPartitions = [];
//      } else if ($scope.selectedPartitions.length === 0 || $scope.selectedPartitions.length > 0) {
//        $scope.selectedPartitions = $scope.topic.partitions.slice(0);
//      }
//    };

    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
          list.splice(idx, 1);
        }
        else {
          list.push(item);
        }
      };

      $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
      };

  $scope.assignPartitions = function assignPartitions (partitions) {
  $scope.showSpinner = true;
    consumerFactory.postConsumerAssignments($scope.consumer, topicName, partitions).then(function (responseAssign){
      consumerFactory.getRecords($scope.consumer, $scope.format).then(function(allData){
        setTopicMessages(allData.data)
        $scope.showSpinner = false;
      }).then(consumerFactory.deleteConsumerSubscriptions($scope.consumer))
    })
  }

});


angularAPP.factory('TopicFactory', function (HttpFactory) {
    var defaultContentType = 'application/vnd.kafka.avro.v2+json';

    return {
          getTopicSummary: function (topicName, endpoint) {
             return HttpFactory.req('GET', endpoint  + '/topics/' + topicName);
          },
          getAllTopics: function(endpoint) {
            return HttpFactory.req('GET', endpoint + "/topics")
          },
          getDataFromConsumer: function(endpoint) {
            createConsumer(endpoint).then(function(response) {
                console.log(response);
            })
          },
          createConsumerInstance: function(endpoint, consumerGroup, consumerInstance, format) {
            return createConsumer(endpoint, consumerGroup, consumerInstance)
          },
          deleteConsumerInstance: function(endpoint, consumerGroup, consumerInstance) {
            return HttpFactory.req('DELETE', endpoint + '/consumers/' + consumerGroup, defaultContentType )
          },
          subscribeConsumerToTopic: function(endpoint, consumerGroup, consumerInstance, topics) {
            return subscribeToTopics(endpoint, consumerGroup, consumerInstance, topics)
          },
          fetchRecords: function(endpoint, consumerGroup, consumerInstance, topics) {
            return
          }
    }

     function createConsumer(endpoint, consumerGroup, consumerInstance, format) {
          var data = {
                    "name": consumerInstance,
                    "format": format,
                    "auto.offset.reset": "earliest",
                    "auto.commit.enable": "true"
                  }
          var contentType = 'application/vnd.kafka.avro.v2+json';
          return HttpFactory.req('POST', endpoint + '/consumers/' + consumerGroup, data, contentType )
      }

     function subscribeToTopics(endpoint, consumerGroup, consumerInstance, topics) {
           var data2 = {
              topics : [
                "position-reports"
              ]
            }

           var data = '{"topics":["position-reports"]}';
          return HttpFactory.req('POST', endpoint + '/consumers/' + consumerGroup + '/instances/' + consumerInstance + '/subscription', data, defaultContentType )
     }
});