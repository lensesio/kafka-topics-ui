kafkaTopicsUIApp.factory('kafkaZooFactory', function ($rootScope, $mdToast, $http, $log, $base64, $q, Oboe, toastFactory) {

  // $rootScope.showCreateTopicButton = true;

  // Figure out it it's a control topic, or normal topic
  function isControlTopic(topicName) {
    return (
    topicName.startsWith("_confluent-controlcenter", 0) ||
    topicName.startsWith("__confluent", 0) ||
    topicName.startsWith("__consumer_offsets", 0) ||
    topicName.startsWith("_confluent-monitoring", 0));
  }

  // Convert to human readable KBytes
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
    var acceptMessageType = 'application/vnd.kafka.' + messagetype + '.v1+json';
    var getData = {
      method: 'GET',
      url: ENV.KAFKA_REST + '/consumers/' + consumer + '/instances/instance/topics/' + topicName,
      headers: {'Accept': acceptMessageType}
    };
    //$log.debug(getData);
    var curlGetAvroData = '  curl -vs --stderr - -X GET -H "Accept: ' + acceptMessageType + '" ' + ENV.KAFKA_REST + '/consumers/' + consumer + '/instances/instance/topics/' + topicName;
    $log.debug(curlGetAvroData);

    // Oboe - stream data in (1000 rows)
    var totals = 0;
    var start = new Date().getTime();
    var myUrl = ENV.KAFKA_REST + '/consumers/' + consumer + '/instances/instance/topics/' + topicName + "?max_bytes=500000";
    var allResults = [];
    $log.debug("Oboe-ing at " + myUrl);
    oboe({
      url: myUrl,
      headers: {"Accept": acceptMessageType}
    })
    /* For every array item ..
     .node('!.*', function (values) {
     allResults.push(values);
     totals = totals + 1;
     var resultingTextData = "";
     if (messagetype == "binary") {
     var data2 = angular.forEach(data, function (d) {
     d.key = $base64.decode(values.key);
     d.value = $base64.decode(values.value);
     });
     resultingTextData = angular.toJson(data2, true);
     } else {
     resultingTextData = angular.toJson(values, true);
     }
     allResults.push(resultingTextData);
     // $scope.aceString = $scope.aceString +"\n" + values;
     if (totals < 3) {
     //  {"key":0,"value":{"itemID":6,"storeCode":"Ashford-New-Rents","count":100},"partition":0,"offset":1002760034}
     //  [{"key":null,"value":{"name":"testUser"},"partition":0,"offset":0}]
     $log.info(totals + " row => ", JSON.stringify(values));
     }
     if (totals == 1000) {
     var end = new Date().getTime();
     $log.info("[" + (end - start) + "] msec to fetch 1000 rows (now aborting)");
     deferred.resolve(allResults);
     this.abort();
     }
     })*/
      .done(function (things) {
        var decodedData = "";
        if (messagetype == "binary") {
          var data2 = angular.forEach(things, function (d) {
            d.key = $base64.decode(d.key);
            d.value = $base64.decode(d.value);
          });
          resultingTextData = angular.toJson(data2, true);
        } else {
          resultingTextData = angular.toJson(things, true);
        }

        // $log.info("COMPLETED entire object " + JSON.stringify(things));
        deferred.resolve(angular.toJson(things, true));
        // we got it
      })
      .fail(function () {
        $log.info("Peiler2");

        // we don't got it
      });

    //   // EXECUTE-2
    //   $http(getData)
    //     .then(
    //       function successCallback(response) {
    //         $log.info("[" + (end - start) + "] msec to consume " + messagetype + " data " + bytesToSize2(JSON.stringify(response).length) + " from topic " + topicName);
    //       },
    //       function errorCallback(response) {
    //         $log.error("Error in consuming " + messagetype + " data : " + JSON.stringify(response));
    //         if (response.data.error_code == 50002) {
    //           if (response.data.message.indexOf("Error deserializing Avro message") > -1)
    //             deferred.resolve("This is not Avro"); // this.showSimpleToast("This is not JSon");
    //         } else {
    //           deferred.resolve("This is not JSon"); // this.showSimpleToast("This is not JSon");
    //           // this.showSimpleToast("This is not Avro")
    //         }
    //       });
    return deferred.promise;
  }

  // Factory should return
  return {

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
      var deferred = $q.defer();
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
        $log.info("Fetched details of " + topicDetails.length + " Topics in [" + (end - start) + "] msec");
        deferred.resolve(topicDetails);
      });
      // $scope.aceString = angular.toJson(response.data, true);
      return deferred.promise;
    },
    // 1. Create a consumer for Avro or Json or Binary data, starting at the beginning of the topic's log.
    // 2. Then consume some data from a topic, which is decoded, translated to JSON, and included in the response.
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
        $log.error("Unsupported type at consumeKafkaRest " + messagetype);
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
        // Create a consumer and fetch data
        $http(postCreateConsumer)
          .then(
            function successCallback(response) {
              $log.info("Success in creating " + messagetype + " consumer " + JSON.stringify(response));
              // Start fetching data
              var textDataPromise = startFetchingData(messagetype, topicName, consumer + "-" + messagetype);
              textDataPromise.then(function (data) {
                //$log.info("Consumed data -> " + data);
                deferred.resolve(data);
              }, function (reason) {
                $log.error('Failed: ' + reason);
              }, function (update) {
                $log.info('Got notification: ' + update);
              });
              // Delete the consumer
              var deleteMyConsumer = {
                method: 'DELETE',
                url: ENV.KAFKA_REST + '/consumers/' + consumer + '-' +  messagetype + '/instances/instance'
              };
              $http(deleteMyConsumer)
                .then(
                  function successCallback(response) {
                    $log.info("Success in deleting consumer " + JSON.stringify(response));
                  },
                  function errorCallback(response) {
                    $log.error("Error in deleting consumer : " + JSON.stringify(error));
                  }
                );
            },
            function errorCallback(response, statusText) {
              if (response.status == 409) {
                $log.info("409 detected! " + response.data.message);
                toastFactory.showSimpleToast(response.data.message);
              }
            }
          );
      }, 10);

      return deferred.promise;
    },

    getDataType: function (topicName) {
      var dataType = {};
      // Check if we know the topic data type a priory
      if (ENV.JSON_TOPICS.indexOf(topicName) > -1) {
        dataType = "json";
      } else if (ENV.BINARY_TOPICS.indexOf(topicName) > -1) {
        dataType = "binary";
      } else {
        angular.forEach($rootScope.topicDetails, function (detail) {
          if (detail.name === topicName) {
            angular.forEach(angular.fromJson($rootScope.schemas), function (schema) {
              if ((schema.value != null) && (schema.value.subject != null) && (schema.value.subject == topicName + "-value")) {
                //$log.info("FOUND YOU !! " + topicName);
                dataType = "avro";
              }
            });
          }
        });
      }
      if (dataType == "") {
        $log.warn("Could not find the message type of topic [" + topicName + "]");
      }
      return dataType;
    }

  }
});