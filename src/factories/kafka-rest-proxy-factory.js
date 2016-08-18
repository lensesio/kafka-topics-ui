/**
 * Kafka-Rest-Proxy angularJS Factory
 * version 0.7-SNAPSHOT (18.Aug.2016)
 *
 * @author antonios@landoop.com
 */
angularAPP.factory('KafkaRestProxyFactory', function ($rootScope, $http, $log, $base64, $q, Oboe, toastFactory) {

  // Topics

  /**
   * Get all topic names
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#get--topics
   */
  function getTopicNames() {

    var url = KAFKA_REST + '/topics';
    $log.debug('  curl -X GET ' + url);
    var start = new Date().getTime();

    var deferred = $q.defer();
    $http.get(url).then(
      function success(response) {
        $log.debug("  curl -X GET " + url + " in [ " + (new Date().getTime() - start) + " ] msec");
        var topicNames = response.data;
        deferred.resolve(topicNames);
      },
      function failure(response) {
        $log.error("Error in getting topics from kafka-rest : " + JSON.stringify(response));
        deferred.reject("Error in getting topics from kafka-rest");
      });

    return deferred.promise;

  }

  /**
   * Get topic metadata
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#get--topics-(string-topic_name)
   */
  function getTopicMetadata(topicName) {

    var url = KAFKA_REST + '/topics/' + topicName;
    $log.debug('  curl -X GET ' + url);
    var start = new Date().getTime();

    var deferred = $q.defer();
    $http.get(url).then(
      function success(response) {
        $log.debug("  curl -X GET " + url + " in [ " + (new Date().getTime() - start) + " ] msec");
        var topicWithMetadata = response.data;
        deferred.resolve(topicWithMetadata);
      },
      function failure(response) {
        $log.error("Error in getting topics from kafka-rest : " + JSON.stringify(response));
        deferred.reject("Error in getting topics from kafka-rest");
      });

    return deferred.promise;

  }

  /**
   * Produce messages to a topic
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#post--topics-(string-topic_name)
   */
  /*** dummy implementation ***/
  function produceMessagesToTopic(topicName) {

    // Maybe we should i) auto-detect and ii) ask user which schema-registry ID to use
    // Key | Value schemas are optional
    var requestJsonObject = {
      //key_schema: "Full schema encoded as a string (e.g. JSON serialized for Avro data)",
      key_schema_id: 1,
      //value_schema: "Full schema encoded as a string (e.g. JSON serialized for Avro data)",
      value_schema_id: 2
    };

    var sampleRecord = {
      key: 1, //  (object) – The message key, formatted according to the embedded format, or null to omit a key (optional)
      value: 2, // (object) – The message value, formatted according to the embedded format
      partition: 1 // (int) – Partition to store the message in (optional)
    };

    var payload = [];
    payload.push(sampleRecord);

    // TODO ..
  }

  // Partitions

  /**
   * Get a list of partitions for the topic
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#get--topics-(string-topic_name)-partitions
   */
  function getPartitions(topicName) {

    var url = KAFKA_REST + '/topics/' + topicName + '/partitions';
    $log.debug('  curl -X GET ' + url);
    var start = new Date().getTime();

    var deferred = $q.defer();
    $http.get(url).then(
      function success(response) {
        $log.debug("  curl -X GET " + url + " in [ " + (new Date().getTime() - start) + " ] msec");
        var partitions = response.data;
        deferred.resolve(partitions);
      },
      function failure(response, status) {
        var msg = "Error in getting partitions of topic " + topicName;
        if (status == 404)
          msg = msg + " Topic does not exist";
        $log.error(msg);
        deferred.reject(msg);
      });

    return deferred.promise;

  }

  /**
   * Get metadata about a particular partition
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#get--topics-(string-topic_name)-partitions-(int-partition_id)
   */
  function getPartitionMetadata(topicName, partitionID) {

    var url = KAFKA_REST + '/topics/' + topicName + '/partitions/' + partitionID;
    $log.debug('  curl -X GET ' + url);
    var start = new Date().getTime();

    var deferred = $q.defer();
    $http.get(url).then(
      function success(response) {
        $log.debug("  curl -X GET " + url + " in [ " + (new Date().getTime() - start) + " ] msec");
        var partitionMetadata = response.data;
        deferred.resolve(partitionMetadata);
      },
      function failure(response, status) {
        var msg = "Error in getting partition [" + partitionID + "] metadata of topic [" + topicName + "]";
        if (status == 404)
          msg = msg + " Topic or partition does not exist";
        $log.error(msg);
        deferred.reject(msg);
      });

    return deferred.promise;

  }

  /**
   * Consume messages from one partition of the topic
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#get--topics-(string-topic_name)-partitions-(int-partition_id)-messages?offset=(int)[&count=(int)]
   */
  function consumeMessagesFromPartition(topicName, partitionID, offset, count) {

    var url = KAFKA_REST + '/topics/' + topicName + '/partitions/' + partitionID +
      '/messages?offset=' + offset + '&count=' + count; // offset and count (int)

    // PENDING IMPLEMENTATION ..

  }

  /**
   * Produce messages to one partition of the topic
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#post--topics-(string-topic_name)-partitions-(int-partition_id)
   */
  function produceMessagesToPartition(topicName, partitionID, offset, count) {

    var url = KAFKA_REST + '/topics/' + topicName + '/partitions/' + partitionID;

    // POST
    // PENDING IMPLEMENTATION ..

  }

  // Consumers

  /**
   * Create a new consumer instance in the consumer group.
   *
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#post--consumers-(string-group_name)
   */
  function createNewConsumer(consumerGroup, consumerName, format, autoOffsetReset, enableAutoCommit) {

    var uniqueConsumer = "Consumer-" + (new Date()).getTime() + '-' + format;
    var url = KAFKA_REST + '/consumers/' + uniqueConsumer;
    $log.info("Creating Kafka Rest consumer for " + messagetype + " data");

    $rootScope.allCurlCommands = "";
    var instance = "instance"; // For creating new --from-beginning

    // @formatter:off
    function getContentType(format) {
      switch (format) {
        case 'avro': return 'application/vnd.kafka.v1+json';
        case 'json': return 'application/vnd.kafka.v1+json';
        case 'binary': return 'application/vnd.kafka.binary.v1+json';
        default: $log.error("Unsupported consumer format : " + format);
      }
    }
    // @formatter:on

    var data = '{"name": "' + instance + '", "format": "' + format + '", "auto.offset.reset": "smallest"}';
    var messageContentType = getContentType(format);
    var postCreateConsumer = {
      method: 'POST',
      url: url,
      data: data,
      headers: {'Content-Type': messageContentType}
    };
    var curlCreateConsumer = 'curl -X POST -H "Content-Type: ' + messageContentType + '" ' +
      "--data '" + data + "' " + KAFKA_REST + '/consumers/' + consumer + '-' + messagetype;
    $log.debug("  " + curlCreateConsumer);

    // Create a consumer and fetch data
    var deferred = $q.defer();
    $http(postCreateConsumer).then(
      function success(response) {
        $log.info("Success in creating " + format + " consumer. InstanceID = " + response.instance_id + " base_uri: " + response.base_uri);
        $rootScope.allCurlCommands = $rootScope.allCurlCommands + "\n" +
          "// Creating " + messagetype + " consumer\n" + curlCreateConsumer + "\n";
        deferred.resolve(uniqueConsumer);
      },
      function failure(response, statusText) {
        if (response.status == 409) {
          $log.info("409 detected! " + response.data.message);
          toastFactory.showSimpleToast(response.data.message);
        }
      }
    );

    return deferred.promise;
  }

  /**
   *
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#post--consumers-(string-group_name)-instances-(string-instance)-offsets
   */
  function commitOffsetForConsumer(consumerName, instance) {

    var url = KAFKA_REST + '/consumers/' + consumerName + '/instances/' + instance + '/offsets';
    var postCommitOffsets = {
      method: 'POST',
      url: url,
      headers: {'Content-Type': 'application/json', 'Accept': 'application/json'}
    };
    $log.debug('  curl -X POST -H "Content-Type: application/json" -H "Accept: application/json" ' + url);
    var start = new Date().getTime();

    var deferred = $q.defer();
    $http(postCommitOffsets).then(
      function success(response) {
        $log.debug("  curl -X POST " + url + " in [" + (new Date().getTime() - start) + " ] msec");
        $log.debug(response);
        deferred.resolve(response);
      },
      function failure(response, statusText) {
        $log.error(response);
        if (response.status == 409) {
          $log.info("409 detected! " + response.data.message);
          // toastFactory.showSimpleToast(response.data.message);
        }
      }
    );

    return deferred.promise;

  }

  /**
   * Delete consumer instance
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#delete--consumers-(string-group_name)-instances-(string-instance)
   */
  function deleteConsumerInstance(consumerName) {

    var url = KAFKA_REST + '/consumers/' + consumer + '-' + messagetype + '/instances/instance';
    $log.debug('  curl -X DELETE ' + url);
    var start = new Date().getTime();

    var deferred = $q.defer();
    $http.delete(url).then(
      function successCallback(response) {
        $rootScope.allCurlCommands = $rootScope.allCurlCommands + "\n" +
          "// Deleting " + messagetype + " consumer \ncurl -X DELETE " + url + "\n";
        $log.debug("  curl -X DELETE " + url + " in [ " + (new Date().getTime() - start) + "] msec");
        deferred.resolve(response.data);
      },
      function failure(error) {
        $log.error("Error in deleting consumer : " + JSON.stringify(error));
      }
    );
  }

  /**
   * Consume messages from a topic
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#get--consumers-(string-group_name)-instances-(string-instance)-topics-(string-topic_name)
   */
  function consumeMessagesFromTopic(consumerName, instanceName, topicName, format) {

    // instanceName is usually hard-code to 'instance'
    var url = KAFKA_REST + '/consumers/' + consumerName + '/instances/' + instanceName + '/topics/' + topicName + KAFKA_REST_ENV.MAX_BYTES;
    if (['avro', 'json', 'binary'].indexOf(format) < 0) {
      $log.error("Unsupported format [" + format + "]");
    }
    var acceptMessageType = 'application/vnd.kafka.' + format + '.v1+json';

    // Oboe - stream data in (roughly 1000 rows)
    var totals = 0;
    var start = new Date().getTime();
    var curlGetData = 'curl -vs --stderr - -X GET -H "Accept: ' + acceptMessageType + '" ' + myUrl;
    $log.debug("  " + curlGetData);
    var allResults = [];
    $log.debug("Oboe-ing at " + myUrl);

    var deferred = $q.defer();
    oboe({
      url: url,
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
        deferred.resolve(things);

        // $rootScope.allCurlCommands = $rootScope.allCurlCommands + "\n" +
        //   "// Fetching " + messagetype + " data\n" + curlGetData + "\n";
        // var resultingTextData = "";
        // if (messagetype == "binary") {
        //   var data2 = angular.forEach(things, function (d) {
        //     d.key = $base64.decode(d.key);
        //     d.value = $base64.decode(d.value);
        //   });
        //   resultingTextData = angular.toJson(data2, true);
        // } else {
        //   resultingTextData = angular.toJson(things, true);
        // }
        // // $log.info("COMPLETED entire object " + JSON.stringify(things));
        // deferred.resolve(angular.toJson(things, true));
      })
      .fail(function () {
        $log.error("Failed consuming " + messagetype + " data from topic " + topicName);
        deferred.reject("Failed consuming " + messagetype + " data from topic " + topicName);
      });

    return deferred.promise;
  }

  // Brokers

  /**
   * Consume messages from a topic
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#get--brokers
   */
  function getBrokers() {

    var url = KAFKA_REST + '/brokers';
    $log.debug("  curl -X GET " + url);
    var start = new Date().getTime();

    var deferred = $q.defer();
    $http.get(url).then(
      function success(response) {
        $log.debug("  curl -X GET " + url + " in [ " + " ] msec responding - " + response.data.brokers);
        deferred.resolve(response.data);
      },
      function failure(response) {
        $log.error("Failure with : " + JSON.stringify(response));
        deferred.reject();
      });

    return deferred.promise;

  }


  /**
   *
   * Some non API related methods
   *
   */

  function isControlTopic(topicName) {
    var isControlTopic = false;
    angular.forEach(KAFKA_REST_ENV.CONTROL_TOPICS, function (controlTopicPrefix) {
      if (topicName.startsWith(controlTopicPrefix, 0))
        isControlTopic = true;
    });
    return isControlTopic;
  }

  function bytesToSize(bytes) {
    var sizes = ['n/a', 'bytes', 'KBytes', 'MBytes', 'GBytes', 'TBytes', 'PBytes', 'EBytes', 'ZBytes', 'YBytes'];
    var i = +Math.floor(Math.log(bytes) / Math.log(1024));
    return (bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0) + ' ' + sizes[isNaN(bytes) ? 0 : i + 1];
  }

  function shortenControlCenterName(topicName) {
    if (isControlTopic(topicName)) {
      return topicName
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
      return topicName;
    }
  }

  /**
   * More of a method for view.controller.js
   * Private method for step-2 of consuming data
   */
  function startFetchingData(messagetype, topicName, consumer) {

    var deferred = $q.defer();

    consumeMessagesFromTopic(consumer, "instance", topicName, format).then(
      function success(things) {
        $rootScope.allCurlCommands = $rootScope.allCurlCommands + "\n" +
          "// Fetching " + messagetype + " data\n" + curlGetData + "\n";
        var resultingTextData = "";
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
      },
      function failure(message) {
        $log.error("Failed consuming " + messagetype + " data from topic " + topicName);
        deferred.reject("Failed consuming " + messagetype + " data from topic " + topicName);
      }
    );

    return deferred.promise;
  }

  $rootScope.allCurlCommands = "";

  // Factory should return
  return {

    // Proxy methods
    getBrokers: function () {
      return getBrokers();
    },
    bytesToSize: function (bytes) {
      return bytesToSize(bytes);
    },
    getTopicNames: function () {
      return getTopicNames();
    },
    getNormalTopics: function (topicNames) {
      var normalTopics = [];
      angular.forEach(topicNames, function (topicName) {
        if (!isControlTopic(topicName)) {
          normalTopics.push(topicName)
        }
        if (normalTopics.toString().indexOf("Error in getting topics from kafka-rest") > -1) {
          $log.error("Error in getting topics from kafka-rest");
        }
      });
      return normalTopics;
    },
    getControlTopics: function (topicNames) {
      var controlTopics = [];
      angular.forEach(topicNames, function (topicName) {
        if (isControlTopic(topicName))
          controlTopics.push(topicName)
      });
      return controlTopics;
    },
    hasExtraConfig: function (topicName) {
      var extraTopicConfig = {};
      angular.forEach($rootScope.topicDetails, function (detail) {
        if (detail.name === topicName) {
          extraTopicConfig = detail.configs;
        }
      });
      return (JSON.stringify(extraTopicConfig).replace("{}", ""));
    },

    /**
     * Composite method, that fetches information about particular topics
     * and adds some enhanced metadata
     */
    getAllTopicInformation: function (topicNames) {

      var start = new Date().getTime();

      var topicsInformation = []; // Array of topic-information with enhanced metadata

      var deferred = $q.defer();
      var promises = topicNames.map(function (topicName) {
        return getTopicMetadata(topicName);
      });
      $q.all(promises).then(
        function success(topicMetadataArray) {

          // Add enhanced metadata: (shortName)
          angular.forEach(topicMetadataArray, function (topicMetadata) {
            topicMetadata.shortName = shortenControlCenterName(topicMetadata.name);
            topicsInformation.push(topicMetadata);
            // @see ### TOPIC-INFORMATION ### in SAMPLES.txt
          });
          $log.debug("  ..pipeline got " + topicMetadataArray.length + " topic metadata in [ " + (new Date().getTime() - start) + " ] msec");
          deferred.resolve(topicsInformation);
        },
        function failure(error) {

        });

      return deferred.promise;

    },

    getDataType: function (topicName) {
      var dataType = {};
      // Check if we know the topic data type a priory
      if (KAFKA_REST_ENV.JSON_TOPICS.indexOf(topicName) > -1) {
        dataType = "json";
      } else if (KAFKA_REST_ENV.BINARY_TOPICS.indexOf(topicName.substring(0, 24)) > -1) {
        dataType = "binary";
      } else {
        // If topicDetails are not available wait
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
    },
    // 1. Create a consumer for Avro or Json or Binary data, starting at the beginning of the topic's log.
    // 2. Then consume some data from a topic, which is decoded, translated to JSON, and included in the response.
    // 3. Finally, clean up.
    // [ avro | json | binary ]
    consumeKafkaRest: function (messagetype, topicName) {
      $rootScope.allCurlCommands = "";
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
        url: KAFKA_REST + '/consumers/' + consumer + '-' + messagetype,
        data: data,
        headers: {'Content-Type': messageContentType}
      };
      $log.info("Creating Kafka Rest consumer for " + messagetype + " data");
      // $log.debug(postCreateConsumer);

      var curlCreateConsumer = 'curl -X POST -H "Content-Type: ' + messageContentType + '" ' +
        "--data '" + data + "' " + KAFKA_REST + '/consumers/' + consumer + '-' + messagetype;
      $log.debug("  " + curlCreateConsumer);

      var deleteConsumer = false;
      setTimeout(function () {
        // Create a consumer and fetch data
        $http(postCreateConsumer)
          .then(
            function successCallback(response) {
              $log.info("Success in creating " + messagetype + " consumer " + JSON.stringify(response));
              $rootScope.allCurlCommands = $rootScope.allCurlCommands + "\n" +
                "// Creating " + messagetype + " consumer\n" + curlCreateConsumer + "\n";
              // Start fetching data
              var textDataPromise = startFetchingData(messagetype, topicName, consumer + "-" + messagetype);
              textDataPromise.then(function (data) {
                //$log.info("Consumed data -> " + data);
                deleteConsumer = true;
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
                toastFactory.showSimpleToast(response.data.message);
              }
            }
          );
      }, 1);

      if (deleteConsumer) {
        // Delete the consumer
        var deleteUrl = KAFKA_REST + '/consumers/' + consumer + '-' + messagetype + '/instances/instance';
        var deleteMyConsumer = {
          method: 'DELETE',
          url: deleteUrl
        };
        var curlDeleteConsumer = 'curl -X DELETE ' + deleteUrl;
        $log.debug("  " + curlDeleteConsumer);
        var start = new Date().getTime();
        $http(deleteMyConsumer)
          .then(
            function successCallback(response) {
              $rootScope.allCurlCommands = $rootScope.allCurlCommands + "\n" +
                "// Deleting " + messagetype + " consumer \n" + curlDeleteConsumer + "\n";
              var end = new Date().getTime();
              $log.info("[" + (end - start) + "] msec to delete the consumer " + JSON.stringify(response));
            },
            function errorCallback(error) {
              $log.error("Error in deleting consumer : " + JSON.stringify(error));
            }
          );
      }

      return deferred.promise;
    }
  }
});