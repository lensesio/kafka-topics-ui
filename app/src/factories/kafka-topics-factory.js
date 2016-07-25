  kafkaZooUIApp.factory('kafkaZooFactory', function ($rootScope, $mdToast, $http, $log, $q) {

  var last = {
    bottom: false,
    top: true,
    left: false,
    right: true
  };

  $rootScope.showCreateSubjectButton = true;
  $rootScope.toastPosition = angular.extend({}, last);

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

    getTopicList: function (onlyControlTopics) {

      var deferred = $q.defer();
      var getData = {
        method: 'GET',
        url: ENV.KAFKA_REST + '/topics'
      };
      $log.info('curl ' + ENV.KAFKA_REST + '/topics');

      setTimeout(function () {
        var topicList = []; // An array holding all cached subjects

        //deferred.notify("Getting topics");
        $http(getData)
          .then(
            function successCallback(response) {
              $log.debug("Got " + response.data.length + " topic name's from kafka-rest : " + JSON.stringify(response.data));
              var urlCalls = [];
              angular.forEach(response.data, function (topicName) {

                // 35 Control Topics
                var isControlTopic = topicName.startsWith("_confluent-controlcenter", 0);
                if (!isControlTopic && !onlyControlTopics) {
                  $log.debug("Normal topic : " + topicName);
                  urlCalls.push($http.get(ENV.KAFKA_REST + '/topics/' + topicName));
                }
                if (onlyControlTopics && isControlTopic) {
                  $log.debug("Control topic : " + topicName);
                  urlCalls.push($http.get(ENV.KAFKA_REST + '/topics/' + topicName));
                }
              });
              $q.all(urlCalls).then(function (results) {
                angular.forEach(results, function (result) {
                  // $log.debug("Got" + JSON.stringify(result.data));
                  if (result.data.name.startsWith("_confluent-controlcenter-0-", 0)) {
                    result.data.shortName = result.data.name
                      .replace('_confluent-controlcenter-0-', '...')
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
                $log.debug("Resolved " + topicList.length + " topic details");
                deferred.resolve(topicList);
              });
              // $scope.aceString = angular.toJson(response.data, true);
            },
            function errorCallback(response) {
              $log.error("Error in getting topics from kafka-rest : " + JSON.stringify(response));
              kafkaZooFactory.showSimpleToast("This is not JSon");
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