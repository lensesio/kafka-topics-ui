kafkaTopicsUIApp.factory('kafkaZooFactory', function ($rootScope, $mdToast, $http, $log, $base64, $q) {

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
    topicName.startsWith("__confluent", 0) ||
    topicName.startsWith("__consumer_offsets", 0) ||
    topicName.startsWith("_confluent-monitoring", 0));
  }

  function bytesToSize2(bytes) {
    var sizes = ['n/a', 'bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
    var i = +Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0) + ' ' + sizes[isNaN(bytes) ? 0 : i + 1];
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

  // Private method for step-2 of consuming data
  function startFetchingData(messagetype, topicName, consumer) {
    var deferred = $q.defer();
    if (['avro', 'json', 'binary'].indexOf(messagetype) < 0) {
      $log.error("Unsupported message-type [" + messagetype + "]");
    }
    var instance = "instance";
    var acceptMessageType = 'application/vnd.kafka.' + messagetype + '.v1+json';
    var getData = {
      method: 'GET',
      url: ENV.KAFKA_REST + '/consumers/' + consumer + '/instances/' + instance + '/topics/' + topicName,
      headers: {'Accept': acceptMessageType}
    };
    //$log.debug(getData);
    var curlGetAvroData = '  curl -vs --stderr - -X GET -H "Accept: ' + acceptMessageType + '" ' + ENV.KAFKA_REST + '/consumers/' + consumer + '/instances/' + instance + '/topics/' + topicName;
    $log.debug(curlGetAvroData);

    setTimeout(function () {
      var start = new Date().getTime();
      var resultingTextData = "";
      // [{"key":null,"value":{"name":"testUser"},"partition":0,"offset":0}]
      // EXECUTE-2
      $http(getData)
        .then(
          function successCallback(response) {
            var end = new Date().getTime();
            $log.info("[" + (end - start) + "] msec to consume " + messagetype + " data " + bytesToSize2(JSON.stringify(response).length) + " from topic " + topicName);
            if (messagetype == "binary") {
              var data = response.data;
              var data2 = angular.forEach(data, function (d) {
                d.key = $base64.decode(d.key);
                d.value = $base64.decode(d.value);
              });
              resultingTextData = angular.toJson(data2, true);
            } else {
              resultingTextData = angular.toJson(response.data, true);
            }
            deferred.resolve(resultingTextData);
          },
          function errorCallback(response) {
            $log.error("Error in consuming " + messagetype + " data : " + JSON.stringify(response));
            if (response.data.error_code == 50002) {
              if (response.data.message.indexOf("Error deserializing Avro message") > -1)
                deferred.resolve("This is not Avro"); // this.showSimpleToast("This is not JSon");
            } else {
              deferred.resolve("This is not JSon"); // this.showSimpleToast("This is not JSon");
              // this.showSimpleToast("This is not Avro")
            }
          });
    }, 10);
    return deferred.promise;
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
    },
    getToastPosition: function () {
      this.sanitizePosition();

      return Object.keys($rootScope.toastPosition)
        .filter(function (pos) {
          return $rootScope.toastPosition[pos];
        })
        .join(' ');
    },
    getTopicList: function () { // Return (Normal-Topics,Control-Topics)
      var deferred = $q.defer();
      $log.debug('  curl ' + ENV.KAFKA_REST + '/topics');
      setTimeout(function () {
        var start = new Date().getTime();
        var getData = {method: 'GET', url: ENV.KAFKA_REST + '/topics'};
        $http(getData)
          .then(
            function successCallback(response) {
              var end = new Date().getTime();
              var topicNames = response.data;
              var normalTopics = [];
              var controlTopics = [];
              // Currently 35 Control Topics
              angular.forEach(topicNames, function (topicName) {
                if (isControlTopic(topicName)) {
                  controlTopics.push(topicName);
                } else {
                  normalTopics.push(topicName);
                }
              });
              $log.info("[" + (end - start) + "] msec to get " + topicNames.length + " topic names. " + controlTopics.length + " control topics and " + normalTopics.length + " Normal topics");
              deferred.resolve(normalTopics, controlTopics);
            },
            function errorCallback(response) {
              $log.error("Error in getting topics from kafka-rest : " + JSON.stringify(response));
              deferred.reject("Error in getting topics from kafka-rest");
            });
      }, 10);
      $rootScope.showSpinner = false;
      return deferred.promise;
    },
    getTopicDetails: function (topicNames) {
      var urlCalls = [];
      var topicDetails = [];
      start = new Date().getTime();
      angular.forEach(topicNames, function (topicName) {
        urlCalls.push($http.get(ENV.KAFKA_REST + '/topics/' + topicName));
      });
      $q.all(urlCalls).then(function (results) {
        angular.forEach(results, function (result) {
          // $log.debug("Got" + JSON.stringify(result.data));
          if (result.data.name.startsWith("_confluent-controlcenter-0-", 0)) {
            result.data.shortName = shortenControlCenterName(result.data.name);
          } else {
            result.data.shortName = result.data.name;
          }
          topicDetails.push(result.data);
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
        end = new Date().getTime();
        $log.info("Fetched details of " + topicList.length + " Topics in [" + (end - start) + "] mesec");
        deferred.resolve(topicDetails);
      });
      // $scope.aceString = angular.toJson(response.data, true);
    },
    // 3 step process for getting data off a kafka topic
    // 1. Create a consumer for Avro data, starting at the beginning of the topic's log.
    // 2. Then consume some data from a topic, which is decoded, translated to JSON, and included in the response.
    // The schema used for deserialization is fetched automatically from the schema registry.
    // 3. Finally, clean up.
    // [ avro | json | binary ]
    consumeKafkaRest: function (messagetype, topicName) {
      var deferred = $q.defer();

      var instance = "instance"; // For creating new --from-beginning
      var d = new Date();
      var consumer = "Consumer-" + d.getTime();

      var messageContentType;
      if (messagetype == "avro") {
        messageContentType = 'application/vnd.kafka.v1+json';
      } else if (messagetype == "json") {
        messageContentType = 'application/vnd.kafka.v1+json';
      } else if (messagetype == "binary") {
        messageContentType = 'application/vnd.kafka.binary.v1+json';
      } else {
        $log.error("Unsupported type at consumeKafkaRest(messagetype)");
      }

      var data = '{"name": "' + instance + '", "format": "' + messagetype + '", "auto.offset.reset": "smallest"}';
      var postCreateConsumer = {
        method: 'POST',
        url: ENV.KAFKA_REST + '/consumers/' + consumer + '-' + messagetype,
        data: data,
        headers: {'Content-Type': messageContentType}
      };
      $log.info("Creating Kafka Rest consumer for " + messagetype + " data");
      // $log.debug(postCreateConsumer);

      var curlCreateConsumer = '  curl -X POST -H "Content-Type: ' + messageContentType + '" ' +
        "--data '" + data + "' " + ENV.KAFKA_REST + '/consumers/' + consumer + '-' + messagetype;
      $log.debug(curlCreateConsumer);

      setTimeout(function () {
        // EXECUTE-1
        $http(postCreateConsumer)
          .then(
            function successCallback(response) {
              // this callback will be called asynchronously when the response is available
              $log.info("Success in creating " + messagetype + " consumer " + JSON.stringify(response));
              var textDataPromise = startFetchingData(messagetype, topicName, consumer + "-" + messagetype);
              textDataPromise.then(function (data) {
                //$log.info("Peiler got2 -> " + data);
                deferred.resolve(data);
              }, function (reason) {
                $log.error('Failed: ' + reason);
              }, function (update) {
                $log.info('Got notification: ' + update);
              });
            },
            function errorCallback(response, statusText) {
              if (response.status == 409) {
                $log.info("409 detected! " + response.data.message);
                kafkaZooFactory.showSimpleToast(response.data.message);
                //var textData = kafkaZooFactory.startFetchingData(messagetype, topicName, consumer + "-" + messagetype);
                //$scope.aceString = textData;
              }
            }
          );
      }, 60);

      return deferred.promise;


      // EXECUTE-3
      // $http(deleteMyAvroConsumer)
      //   .then(
      //     function successCallback(response) {
      //       $log.info("Success in deleting avro consumer " + JSON.stringify(response));
      //     },
      //     function errorCallback(response) {
      //       // called asynchronously if an error occurs
      //       // or server returns response with an error status.
      //       $log.error("Error in creating avro consumer : " + JSON.stringify(error));
      //     }
      //   )
      // var deleteMyAvroConsumer = {
      //   method: 'DELETE',
      //   url: ENV.KAFKA_REST + '/consumers/rest_proxy_ui_consumer/instances/my_consumer_instance'
      // };
      //
      // $log.debug(deleteMyAvroConsumer);
      //$log.info("Success in creating avro consumer " + JSON.stringify(response));
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