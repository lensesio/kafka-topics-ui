kafkaTopicsUIApp.factory('kafkaZooFactory', function ($rootScope, $mdToast, $http, $log, $q) {

  var last = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };

  $rootScope.showCreateSubjectButton = true;
  $rootScope.toastPosition = angular.extend({}, last);

  // Figure out it it's a control topic, or normal topic
  function isControlTopic(topicName) {
    return (
      topicName.startsWith("_confluent-controlcenter", 0) ||
      topicName.startsWith("__confluent") ||
      topicName.startsWith("__consumer_offsets") ||
      topicName.startsWith("_confluent-monitoring")
    );
  }

  // Shorten Confluent Control Center topic name - to improve visualization
  function shortenControlCenterName(topicName) {
    topicName.replace('_confluent-controlcenter-0-', '...')
    // .replace('aggregate-topic-partition', 'aggregate-topic')
      .replace('MonitoringMessageAggregatorWindows', 'monitor-msg')
      .replace('aggregatedTopicPartitionTableWindows', 'aggregate-window')
      .replace('monitoring-aggregate-rekey', 'monitor-rekey')
      .replace('MonitoringStream', 'monitor-stream')
      .replace('MonitoringVerifierStore', 'monitor-verifier')
      .replace('...Group', '...group')
      .replace('FIFTEEN_SECONDS', '15sec')
      .replace('ONE_HOUR', '1hour')
      .replace('ONE_WEEK', '1week');
  }

  // Factory should return
  return {

    sanitizePosition: function () {
      var current = $rootScope.toastPosition;

      if (current.bottom && last.top) current.top = false;
      if (current.top && last.bottom) current.bottom = false;
      if (current.right && last.left) current.left = false;
      if (current.left && last.right) current.right = false;

      last = angular.extend({}, current);
    },
    hideToast: function () {
      $mdToast.hide();
    },
    showSimpleToast: function (message) {
      $mdToast.show(
        $mdToast.simple()
          .textContent(message)
          .position(this.getToastPosition())
          .hideDelay(4000)
      );
    }
    ,
    getToastPosition: function () {
      this.sanitizePosition();

      return Object.keys($rootScope.toastPosition)
        .filter(function (pos) {
          return $rootScope.toastPosition[pos];
        })
        .join(' ');
    },

    // `Boolean` - Whether we will display Kafka [ Control Topics || Normal Topics ]
    getTopicList: function (displayControlTopics) {

      var deferred = $q.defer();
      var getData = {
        method: 'GET',
        url: ENV.KAFKA_REST + '/topics'
      };
      $log.info('curl ' + ENV.KAFKA_REST + '/topics');

      setTimeout(function () {
        var topicList = [];
        var start = new Date().getTime();
        $http(getData)
          .then(
            function successCallback(response) {
              var end = new Date().getTime();
              var topicNames = response.data;
              var normalTopics = [];
              var controlTopics = [];
              var normalTopicsUrlCall = [];
              var controlTopicsUrlCall = [];
              // Currently 35 Control Topics
              angular.forEach(topicNames, function (topicName) {
                if (isControlTopic(topicName)) {
                  controlTopics.push(topicName);
                  controlTopicsUrlCall.push($http.get(ENV.KAFKA_REST + '/topics/' + topicName));
                } else {
                  normalTopics.push(topicName);
                  normalTopicsUrlCall.push($http.get(ENV.KAFKA_REST + '/topics/' + topicName));
                }
              });
              $log.info("Got " + topicNames.length + " topic names. " + controlTopics.length + " control topics and " + normalTopics.length + " Normal topics in [" + (end - start) + "] msec");

              var urlCalls = [];
              if (displayControlTopics) {
                $log.info("Getting details of control topics : " + JSON.stringify(controlTopics));
                urlCalls = controlTopicsUrlCall;
              } else {
                $log.info("Getting details of topics: " + JSON.stringify(normalTopics));
                urlCalls = normalTopicsUrlCall;
              }

              start = new Date().getTime();
              $q.all(urlCalls).then(function (results) {
                angular.forEach(results, function (result) {
                  // $log.debug("Got" + JSON.stringify(result.data));
                  if (result.data.name.startsWith("_confluent-controlcenter-0-", 0)) {
                    result.data.shortName = shortenControlCenterName(result.data.name);
                  } else {
                    result.data.shortName = result.data.name;
                  }
                  topicList.push(result.data);
                  // {"
                  //   name":"connect-test","
                  //   configs":{},
                  //   "partitions":[
                  //     {
                  //          "partition":0,
                  //          "leader":0,
                  //           "replicas":[
                  //               {
                  //                  "broker":0,
                  //                  "leader":true,
                  //                  "in_sync":true
                  //               }
                  //           ]
                  //      },{"partition":1,"...

                });
                $rootScope.showSpinner = false;
                end = new Date().getTime();
                $log.info("Fetched details of " + topicList.length + " Topics in [" + (end - start) + "] mesec");
                deferred.resolve(topicList);
              });
              // $scope.aceString = angular.toJson(response.data, true);
            },
            function errorCallback(response) {
              $log.error("Error in getting topics from kafka-rest : " + JSON.stringify(response));
              kafkaZooFactory.showSimpleToast("No connectivity. Could not get topic details");
            });

      }, 10);

      return deferred.promise;

    }

    //   var data = '{"name": "my_consumer_instance", "format": "avro", "auto.offset.reset": "smallest"}';
    //   var curlCreateConsumer = 'curl -X POST -H "Content-Type: application/vnd.kafka.v1+json" \ ' +
    //     "--data '" + data + "' \ " +
    //     ENV.KAFKA_REST + '/consumers/rest_proxy_ui_consumer';
    //   $log.debug(curlCreateConsumer);
    //
    //   // EXECUTE-1
    //   $http(postCreateAvroConsumer)
    //     .then(
    //       function successCallback(response) {
    //         // this callback will be called asynchronously when the response is available
    //         $log.info("Success in creating avro consumer " + JSON.stringify(response));
    //       },
    //       function errorCallback(response) {
    //         $log.info("Error in deleting avro consumer : " + JSON.stringify(response) +
    //           "\n data: " + JSON.stringify(response.data) +
    //           "\n status: " + response.status +
    //           "\n headers: " + response.headers +
    //           "\n config: " + JSON.stringify(response.headers) +
    //           "\n statusText: " + response.statusText);
    //       }
    //     );
    //
    //   // return $http(postCreateAvroConsumer)
    //   //   .then(function (response) {
    //   //     return response.data;
    //   //   }, function (response) {
    //   //     return response;
    //   //   });
    // }

  }
});