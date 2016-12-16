angularAPP.controller('KafkaTopicsListCtrl', function ($scope, $rootScope, $location, $routeParams, $mdToast, $log, KafkaRestProxyFactory, toastFactory, env) {

  $log.info("Starting kafka-topics controller : list (getting topic info)");
  toastFactory.hideToast();

  $rootScope.$watch('topicCategoryUrl' ,function(){
    $scope.displayingControlTopics = false;
    if ($rootScope.topicCategoryUrl =='c') {
      $scope.displayingControlTopics = true;
      }
    },true);

  if(typeof $routeParams.cluster == 'undefined') {
    getLeftListTopics();
  }

  $scope.$on('$routeChangeSuccess', function() {
    $scope.$watch(function () {
      return $routeParams.cluster;
    }, function (a) {
      if(typeof $routeParams.cluster !== 'undefined') {
      getLeftListTopics();
      }
    }, true);
  });
  $scope.getPartitionMessage = function (topicName) {
    return doCountsForTopic(topicName);
  };

  $scope.isNormalTopic = function (topicName) {
    return KafkaRestProxyFactory.isNormalTopic(topicName);
  };

  $scope.displayingControlTopics = $scope.isNormalTopic;

  $scope.hasExtraConfig = function (topicName) {
    var topicDetails = KafkaRestProxyFactory.isNormalTopic(topicName) ? $rootScope.topicDetails : $rootScope.controlTopicDetails;
    var extra =KafkaRestProxyFactory.hasExtraConfig(topicName, topicDetails);
    if (extra != '') {
     return Object.keys(JSON.parse(extra)).length
     } else
    return 0;
  };


  $scope.getDataType = function (topicName) {
    return KafkaRestProxyFactory.getDataType(topicName);
  };

  $scope.shortenControlCenterName = function (topicName) {
    return KafkaRestProxyFactory.shortenControlCenterName(topicName);
  }

  $scope.listClick = function (topicName) {
    if (KafkaRestProxyFactory.isNormalTopic(topicName) == false) {
      $scope.CategoryTopicUrls = 'c';
    } else {
      $scope.CategoryTopicUrls = 'n';
    }
    $location.path("cluster/"+ env.getSelectedCluster().NAME +"/topic/" +  $scope.CategoryTopicUrls + "/" + topicName, false);
  }

  function doCountsForTopic(topicName) {
    var counts = {
        partitions : 0,
        replications : 0
    }

    angular.forEach($rootScope.topicDetails, function (topicDetail) {
      if (topicDetail.name == topicName) {
        counts.replications = topicDetail.partitions[0].replicas.length;
        counts.partitions = topicDetail.partitions.length;
      }
    });

    angular.forEach($rootScope.controlTopicDetails, function (topicDetail) {
      if (topicDetail.name == topicName) {
        counts.replications = topicDetail.partitions[0].replicas.length;
        counts.partitions = topicDetail.partitions.length;
      }
    });

    return doLalbels(counts.replications, 'Replication') + ' \u2A2F ' + doLalbels(counts.partitions, 'Partition');
  }


function getLeftListTopics() {
  KafkaRestProxyFactory.loadSchemas();
  KafkaRestProxyFactory.getTopicNames().then(
    function success(allTopicNames) {
      $scope.topics = KafkaRestProxyFactory.getNormalTopics(allTopicNames);;
      $scope.controlTopics = KafkaRestProxyFactory.getControlTopics(allTopicNames);;
      $rootScope.topicsCache = $scope.topics; //TODO do we need that??

      KafkaRestProxyFactory.getAllTopicInformation($scope.topics).then(
        function success(topicDetails) {
          $rootScope.topicDetails = topicDetails;

          // .. only then fetch [Control] topics info
          KafkaRestProxyFactory.getAllTopicInformation($scope.controlTopics).then(
            function success(controlTopicDetails) {
              $rootScope.controlTopicDetails = controlTopicDetails;
            });

        }, function failure(reason) {
          $log.error('Failed: ' + reason);
        });

      $scope.topicsPerPage = 7;

      $scope.controlTopicIndex = $scope.controlTopics.indexOf($rootScope.topicName );
      $scope.controlTopicPage = Math.ceil($scope.controlTopicIndex / $scope.topicsPerPage);
      if ($scope.controlTopicPage < 1) {
        $scope.controlTopicPage = 1
      }

      $scope.normalTopicIndex = $scope.topics.indexOf($rootScope.topicName );
      $scope.normalTopicPage = Math.ceil($scope.normalTopicIndex / $scope.topicsPerPage);
      if ($scope.normalTopicPage < 1) {
        $scope.normalTopicPage = 1
      }

    }, function (reason) {
      $log.error('Failed: ' + reason);
      toastFactory.showSimpleToast("No connectivity. Could not get topic names");
        $scope.topics = []
        $scope.controlTopics = []
    }, function (update) {
      $log.info('Got notification: ' + update);
    });
    }

  function doLalbels(count, name) {
    if (count == 0) return 'None ' + name;
    else if (count == 1) return '1 ' + name;
    else return count + ' ' + name +'s';
  }
});