angularAPP.controller('ViewTopicCtrl', function ($scope, $routeParams, $rootScope, $filter, $log, $location,$cookies, $http, TopicFactory, env, $q, $timeout , consumerFactory, HttpFactory) {

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
  $scope.disableAllPartitionButtons = false;
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
    console.log(data)
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
 * topic data / advanced / slider
********************************/

//$scope.slider = {
//    minValue: 40,
//    maxValue: 60,
//    options: {
//        floor: 0,
//        ceil: 1000000,
//        step: 1,
//        minRange: 10,
//        maxRange: 30,
//        pushRange: true
//    }
//};

//
//$scope.slider = {
//  minValue: 10,
//  maxValue: 90,
//  options: {
//    floor: 0,
//    ceil: 100,
//  }
//};
$scope.slider = {
       minValue: 123,
       maxValue: 156,
       options: {
         floor: 123,//allData[0].offset,
         ceil: 234//allData[allData.length - 1].offset,
       }
     };

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


    if(allData.length > 0) {

     var floor = $scope.firstOffsetForPartition ? $scope.firstOffsetForPartition : allData[0].offset;

     $scope.slider = {
       id : 'slider-id',
       minValue: allData[0].offset,
       maxValue: allData[allData.length - 1].offset,
       options: {
         floor: floor,
         ceil: allData[allData.length - 1].offset + 100,
         draggableRangeOnly: true,
         onChange: function() {
               console.log('on change ', $scope.slider.minValue); // logs 'on end slider-id'
         },
         onEnd: function(){
             console.log('on end ', $scope.slider.minValue, $scope.selectedPartition); //TODO
             $scope.assignPartitions($scope.selectedPartition, $scope.slider.minValue, false)
         }
       }
     };
     }

//      $scope.$watch('slider.minValue', function() {
//             console.log("AA", $scope.slider.minValue, $scope.selectedPartition);
//             $scope.assignPartitions($scope.selectedPartition, $scope.slider.minValue, false)
//         });

//     $scope.rows = allData;

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

  createAndFetch(consumerFactory.getConsumerType(topicName), topicName);
  $scope.hideTab = false;

  function retry(previousFormatTried, topicName){ //todo put me in factory and just return types
    switch(previousFormatTried) {
        case 'avro':
            createAndFetch('json', topicName);
            break;
        case 'json':
            createAndFetch('binary', topicName);
            break;
        default:
            createAndFetch('binary', topicName);
    }
  }

  function createAndFetch(format, topicName) {

    consumerFactory.createConsumers(format, topicName)
        .then(function(res){
            $scope.consumer = consumerFactory.getConsumer(format); //TODO why scope? we should set in factory
            return consumerFactory.getConsumer(format);
        }).then(function(consumer) {
            consumerFactory.subscribeAndGetData(consumer, format, topicName).then(function (allData) {
                if(allData == -1) {
                    console.log("NEED TO RETRY", allData, $scope.consumer, topicName);
                    retry(format, topicName);
                } else {
                      console.log("NEED TO RENDER", allData, $scope.consumer, topicName);
                      console.log("DATA LENGTH", allData.data.length)
                      $scope.format=format;
                      setTopicMessages(allData.data)
                      $scope.showSpinner = false;
                      if(format=='binary') {
                        $scope.hideTab = true;
                      }
                }
            });

        })


//    consumerFactory.createConsumers(format, topicName).then( function successCallback(response) {
//        console.log("GOT IN")
//        var uuid = $cookies.getAll().uuid;
//        if (response.status == 409 || response.status == 200) { //Why we ignore 409 conflict here? if 409 should go to failure?
//          //the same logic is in factory
//          var consumer = {group :'kafka_topics_ui_'+format+'_' + uuid, instance: 'kafka-topics-ui-'+ format };
//          $scope.consumer=consumer; //why scope? we should set in factory
//
//          consumerFactory.subscribeAndGetData(consumer, format, topicName).then(function (allData) {
//            console.log("BBB", allData)
//            if ((allData.status == 500 || allData.data.error_code == 404 ) && format=='avro') {
//              createAndFetch('json', topicName)
//            }
//            else if ((allData.status == 500 || allData.data.error_code == 404 ) && format=='json') {
//              createAndFetch('binary', topicName)
//            } else if (!(allData.status == 500 || allData.data.error_code == 404 )){
//
//              console.log('Format is:', format)
//              $scope.format=format;
//              setTopicMessages(allData.data)
//              $scope.showSpinner = false;
//              if(format=='binary') {
//                $scope.hideTab = true;
//              }
//            } else {
//            }
//          })
//          if (response.status == 409) {
//              var msg = response.data.message;
//              msg = "Conflict 409. " + msg;
//              $log.warn(msg)
//           }
//         } else {
//          $log.warn(response.data.message)
//         }
//    }, function errorCallback(responseRecords) {
//        console.warn('ERROR IS ',responseRecords)
//    })
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

//    $scope.toggle = function (item, list) {
//        var idx = list.indexOf(item);
//        if (idx > -1) {
//          list.splice(idx, 1);
//        }
//        else {
//          list.push(item);
//        }
//      };
//
//      $scope.exists = function (item, list) {
//        return list.indexOf(item) > -1;
//      };


  $scope.assignPartitions = function assignPartitions (partitions, offset, firstTime) {
//  $scope.showSpinner = true;
  if (!angular.isDefined(offset)){offset = 0}
    consumerFactory.postConsumerAssignments($scope.consumer, topicName, partitions).then(function (responseAssign){
      consumerFactory.postConsumerPositions($scope.consumer, topicName, partitions, offset).then(function(responseOffset){
        consumerFactory.getRecords($scope.consumer, $scope.format).then(function(allData){
          setTopicMessages(allData.data)
//          $scope.showSpinner = false;
            if(firstTime) { console.log('IS FIRST');$scope.firstOffsetForPartition = allData.data[0].offset }
            $scope.showAdvanced = true;
        }).then(consumerFactory.deleteConsumerSubscriptions($scope.consumer))
      })
    })
  }



//    $scope.assignPartitions = function assignPartitions(partitions, offset, firstTime) {
//        $scope.selectedPartition = partitions;
//  //      $scope.showSpinner = true;
//        if (!angular.isDefined(offset)){ offset = 0 }
//  //        beginning = true
//          console.log("SKATA", partitions)
//          consumerFactory.postConsumerAssignments($scope.consumer, topicName, partitions).then(function (responseAssign){
//
//
//  //          if(beginning) {
//  //            console.log("GOING BEGINNING")
//  //              consumerFactory.seekToBeginningOrEnd('beginning', $scope.consumer, topicName, partitions).then(function(responseOffset){
//  //                consumerFactory.getRecords($scope.consumer, $scope.format).then(function(allData){
//  //                  setTopicMessages(allData.data)
//  //    //              $scope.showSpinner = false;
//  //                  $scope.showAdvanced = true;
//  //                  $scope.disableAllPartitionButtons = true;
//  //                }).then(consumerFactory.deleteConsumerSubscriptions($scope.consumer))
//  //              })
//  //
//  //          } else {
//                console.log("GOING FIRST TIME")
//                consumerFactory.postConsumerPositions($scope.consumer, topicName, partitions, offset).then(function(responseOffset){
//
//                  //for debug
//  //                var getAssignments = {
//  //                              method: 'GET',
//  //                              url: env.KAFKA_REST().trim() + '/consumers/' + $scope.consumer.group + '/instances/' + $scope.consumer.instance + '/assignments',
//  //                              headers: {'Content-Type': 'application/vnd.kafka.v2+json' }
//  //                            }
//  //
//  //                $http(getAssignments).then(function(v) {
//  //                    console.log("MAAAS ", v);
//  //                })
//
//
//                  consumerFactory.getRecords($scope.consumer, $scope.format).then(function(allData){
//
//                    if(firstTime) { console.log('IS FIRST');$scope.firstOffsetForPartition = allData.data[0].offset }
//                    setTopicMessages(allData.data)
//
//  //                  $scope.showSpinner = false;
//                    $scope.showAdvanced = true;
//                    $scope.disableAllPartitionButtons = true;
//                  }).then(consumerFactory.deleteConsumerSubscriptions($scope.consumer))
//                })
//
//  //          }
//
//          })
//    }

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