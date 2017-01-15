angularAPP.controller('HomeCtrl', function ($scope, $rootScope, $location, $routeParams, $mdToast, $log, KafkaRestProxyFactory, toastFactory, env, KafkaBackendFactory) {
  $log.info("Starting kafka-topics controller : home");
  toastFactory.hideToast();

  $rootScope.showList = false;



     $rootScope.$watch(function () {
        return $rootScope.cluster;
      }, function (a) {
     if(typeof $rootScope.cluster == 'object'){
       getLeftListTopics();
      }
     }, true);

    $scope.displayingControlTopics = $scope.isNormalTopic;

    $scope.shortenControlCenterName = function (topicName) {
      return KafkaRestProxyFactory.shortenControlCenterName(topicName);
    }

    $scope.topicsPerPage = 7;

  function getLeftListTopics() {

  $scope.topics= KafkaBackendFactory.getListInfo() ;

  function isControlTopic(value) {
    return value.isControlTopic;
  }
  function isNormalTopic(value) {
    return !isControlTopic(value);
  }
  $scope.controlTopics = $scope.topics.filter(isControlTopic);
  $scope.normalTopics = $scope.topics.filter(isNormalTopic);
    $scope.listClick = function (topicName, isControlTopic) {
      if (isControlTopic == true) {
        $scope.CategoryTopicUrls = 'c';
      } else {
        $scope.CategoryTopicUrls = 'n';
      }
      $location.path("cluster/"+ env.getSelectedCluster().NAME +"/topic/" +  $scope.CategoryTopicUrls + "/" + topicName, false);
    }

    $scope.topicDataType = function(topic) {
    var dataType = '...';
    if (topic.valueType && topic.keyType &&  topic.keyType ==  topic.valueType ){ dataType = topic.valueType}
    else if (topic.valueType && topic.keyType){ dataType = topic.valueType + '/' + topic.keyType}
    else if (topic.valueType || topic.keyType){ dataType = topic.valueType + topic.keyType}


    return dataType;
    }
  }

  function doLabels(count, name) {
      if (count == 0) return 'None ' + name;
      else if (count == 1) return '1 ' + name;
      else return count + ' ' + name +'s';
  }

});