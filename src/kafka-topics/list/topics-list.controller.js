angularAPP.controller('KafkaTopicsListCtrl', function ($scope, $rootScope, $location, $routeParams, $mdToast, $log, KafkaRestProxyFactory, toastFactory, env, KafkaBackendFactory) {
  $log.info("Starting kafka-topics controller : list (getting topic info)");
  toastFactory.hideToast();

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

KafkaBackendFactory.getListInfo().then(function (allData){
$scope.topics = allData;

function isControlTopic(value) {
  return value.isControlTopic;
}
function isNormalTopic(value) {
  return !isControlTopic(value);
}

$scope.controlTopics = $scope.topics.filter(isControlTopic);
$scope.normalTopics = $scope.topics.filter(isNormalTopic);

}) ;

  $scope.listClick = function (topicName, isControlTopic) {
    if (isControlTopic == true) {
      $scope.CategoryTopicUrls = 'c';
    } else {
      $scope.CategoryTopicUrls = 'n';
    }
    $location.path("cluster/"+ env.getSelectedCluster().NAME +"/topic/" +  $scope.CategoryTopicUrls + "/" + topicName, false);
  }
}

function doLabels(count, name) {
    if (count == 0) return 'None ' + name;
    else if (count == 1) return '1 ' + name;
    else return count + ' ' + name +'s';
}
});