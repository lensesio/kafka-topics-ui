/**
 * Kafka-Rest-Proxy angularJS Factory
 * version 0.7-SNAPSHOT (18.Aug.2016)
 *
 * @author antonios@landoop.com
 */
angularAPP.factory('KafkaRestProxyFactory', function ($rootScope, $http, $log, $base64, $q, Oboe, toastFactory, env) {

  // Topics
  var schemas;

  /**
   * Get all topic names
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#get--topics
   */
  function getTopicNames() {

    var url = env.KAFKA_REST() + '/topics';
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

    var url = env.KAFKA_REST() + '/topics/' + topicName;
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

    var url = env.KAFKA_REST() + '/topics/' + topicName + '/partitions';
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

    var url = env.KAFKA_REST() + '/topics/' + topicName + '/partitions/' + partitionID;
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

    var url = env.KAFKA_REST() + '/topics/' + topicName + '/partitions/' + partitionID +
      '/messages?offset=' + offset + '&count=' + count; // offset and count (int)

    // PENDING IMPLEMENTATION ..

  }

  /**
   * Produce messages to one partition of the topic
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#post--topics-(string-topic_name)-partitions-(int-partition_id)
   */
  function produceMessagesToPartition(topicName, partitionID, offset, count) {

    var url = env.KAFKA_REST() + '/topics/' + topicName + '/partitions/' + partitionID;

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

    var url = env.KAFKA_REST() + '/consumers/' + consumerName;
    $log.info("Creating Kafka Rest consumer for " + format + " data");

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
    var curlCreateConsumer = 'curl -X POST -H "Content-Type: ' + messageContentType + '" ' + "--data '" + data + "' " + url;
    $log.debug("  " + curlCreateConsumer);

    // Create a consumer and fetch data
    var deferred = $q.defer();
    $http(postCreateConsumer).then(
      function success(response) {
        $log.info("Success in creating " + format + " consumer. instance_id = " + response.data.instance_id + " base_uri = " + response.data.base_uri);
        $rootScope.allCurlCommands = $rootScope.allCurlCommands + "\n" +
          "// Creating " + format + " consumer\n" + curlCreateConsumer + "\n";
        deferred.resolve(response.data);
      },
      function failure(response, statusText) {
        var msg = response.data.message;
        if (response.status == 409) msg = "409 " + msg;
        $log.warn(msg);
        deferred.reject();
      }
    );

    return deferred.promise;
  }

  /**
   *
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#post--consumers-(string-group_name)-instances-(string-instance)-offsets
   */
  function commitOffsetForConsumer(consumerName, instance) {

    var url = env.KAFKA_REST() + '/consumers/' + consumerName + '/instances/' + instance + '/offsets';
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

    var url = env.KAFKA_REST() + '/consumers/' + consumerName + '/instances/instance';
    var curlDeleteConsumer = '  curl -X DELETE ' + url;
    $log.debug(curlDeleteConsumer);
    var start = new Date().getTime();

    var deferred = $q.defer();
    $http.delete(url).then(
      function successCallback(response) {
        $rootScope.allCurlCommands = $rootScope.allCurlCommands + "\n" +
          "// Deleting consumer \ncurl -X DELETE " + curlDeleteConsumer + "\n";
        $log.debug("  curl -X DELETE " + url + " in [ " + (new Date().getTime() - start) + "] msec");
        deferred.resolve(response.data);
      },
      function failure(error) {
        var msg = "Error in deleting consumer : " + JSON.stringify(error);
        $log.error(msg);
        deferred.reject(msg);
      }
    );

    return deferred.promise;

  }

  /**
   * Consume messages from a topic
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#get--consumers-(string-group_name)-instances-(string-instance)-topics-(string-topic_name)
   */
  function consumeMessagesFromTopic(consumerName, instanceName, topicName, format) {

    // instanceName is usually hard-code to 'instance'
    var url = env.KAFKA_REST() + '/consumers/' + consumerName + '/instances/' + instanceName + '/topics/' + topicName + env.MAX_BYTES();
    if (['avro', 'json', 'binary'].indexOf(format) < 0) {
      $log.error("Unsupported format [" + format + "]");
    }
    var acceptMessageType = 'application/vnd.kafka.' + format + '.v1+json';

    // Oboe - stream data in (roughly 1000 rows)
    var totals = 0;
    var curlGetData = 'curl -vs --stderr - -X GET -H "Accept: ' + acceptMessageType + '" ' + url;
    $log.debug("  " + curlGetData);
    var allResults = [];
    var start = new Date().getTime();
    $log.debug("Oboe-ing at " + url);

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
        $rootScope.allCurlCommands = $rootScope.allCurlCommands + "\n" +
          "// Fetching " + format + " data\n" + curlGetData + "\n";

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
        var msg = "Failed consuming " + format + " data from topic " + topicName;
        $log.error(msg);
        deferred.reject(msg);
      });

    return deferred.promise;
  }

  // Brokers

  /**
   * Consume messages from a topic
   * @see http://docs.confluent.io/3.0.0/kafka-rest/docs/api.html#get--brokers
   */
  function getBrokers() {

    var url = env.KAFKA_REST() + '/brokers';
    $log.debug("  curl -X GET " + url);
    var start = new Date().getTime();

    var deferred = $q.defer();
    $http.get(url).then(
      function success(response) {
        $log.debug("  curl -X GET " + url + " in [ " + (new Date().getTime() - start) + " ] msec with " + response.data.brokers.length + " brokers");
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
    angular.forEach(TOPIC_CONFIG.CONTROL_TOPICS, function (controlTopicPrefix) {
      if (topicName.startsWith(controlTopicPrefix, 0))
        isControlTopic = true;
    });
    return isControlTopic;
  }

  function isNormalTopic(topicName) {
    return !isControlTopic(topicName);
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
   * Private method - part of pipeline (step 2)
   */
  function startFetchingData(format, topicName, consumer) {

    var deferred = $q.defer();

    consumeMessagesFromTopic(consumer, "instance", topicName, format).then(
      function success(things) {
        // var resultingTextData = "";
        if (format == "binary") {
          var data2 = angular.forEach(things, function (d) {
            d.key = $base64.decode(d.key);
            d.value = $base64.decode(d.value);
          });
          // resultingTextData = angular.toJson(data2, true);
        } else {
          // resultingTextData = angular.toJson(things, true);
        }

        // $log.info("COMPLETED entire object " + JSON.stringify(things));
        deferred.resolve(things);
      },
      function failure(message) {
        deferred.reject(message); // message is logged up-stream
      }
    );

    return deferred.promise;

  }

  $rootScope.allCurlCommands = "";

  // Factory should return
  return {

    // Proxy methods
    isNormalTopic: function (topicName) {
      return isNormalTopic(topicName);
    },
    shortenControlCenterName: function(topicName) {
      return shortenControlCenterName(topicName)
    },
    getBrokers: function () {
      return getBrokers();
    },
    bytesToSize: function (bytes) {
      return bytesToSize(bytes);
    },
    getTopicNames: function () {
      return getTopicNames();
    },
    deleteConsumerInstance: function (consumerName) {
      return deleteConsumerInstance(consumerName);
    },
    getNormalTopics: function (topicNames) {
      var normalTopics = [];
      angular.forEach(topicNames, function (topicName) {
        if (isNormalTopic(topicName)) {
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

    hasExtraConfig: function (topicName, topicDetails) {
      var extraTopicConfig = {};
      angular.forEach(topicDetails, function (detail) {
        if (detail.name === topicName) {
          extraTopicConfig = detail.configs;
        }
      });
      if(Object.keys(extraTopicConfig).length > 1)
      return (JSON.stringify(extraTopicConfig).replace("{}", ""));
      else
      return "";
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
      var dataType = "...";
      // Check if we know the topic data type a priory
      if (TOPIC_CONFIG.JSON_TOPICS && TOPIC_CONFIG.JSON_TOPICS.indexOf(topicName) > -1) {
        dataType = "json";
      } else if (TOPIC_CONFIG.BINARY_TOPICS && TOPIC_CONFIG.BINARY_TOPICS.indexOf(topicName.substring(0, 24)) > -1) {
        dataType = "binary";
      } else {
        // If topicDetails are not available wait
        angular.forEach($rootScope.topicDetails, function (detail) {
          if (detail.name === topicName) {
            angular.forEach(angular.fromJson(schemas), function (schema) {
              if (
              ((schema.value != null) && (schema.value.subject != null) && (schema.value.subject == topicName + "-value")) &&
              ((schema.key != null) && (schema.key.subject != null) && (schema.key.subject == topicName + "-key"))
                ) {
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

    /**
     * Composite method.
     *
     *   Create avro|json|binary consumer
     *   Consume some data
     *   Delete consumer
     */
    consumeKafkaRest: function (format, topicName) {
      $rootScope.allCurlCommands = "";

      var start = (new Date()).getTime();
      var consumer = "Consumer-" + start;
      var consumerName = consumer + "-" + format;

      var deferred = $q.defer();
      createNewConsumer(consumer, consumerName, format, "smallest", true).then( // TODO (true), latest
        function success(data) {
          //data.instance_id + " base_uri = " + response.data.base_uri
          startFetchingData(format, topicName, consumerName).then(
            function success(data) {
              //$log.info("Consumed data -> " + data);
              // At the end .. let's see if we need to clean-up
              deleteConsumerInstance(consumerName).then(
                function success() {
                  $log.debug("  ..pipeline create-consume-delete in [ " + ((new Date()).getTime() - start) + " ] msec");
                  deferred.resolve(data);
                } // Failures are managed in the factory
              );
            } // Failures are managed in the factory
          )
        },
        function failure(response) {
          toastFactory.showSimpleToast(response);
        }
      );

      return deferred.promise;

    },

    //News
    loadSchemas: function () {
          var start = new Date().getTime();
          var schemasPromise = this.consumeKafkaRest("json", "_schemas");
          schemasPromise.then(function (allSchemas) {
             var end = new Date().getTime();
//            $rootScope.schemas = allSchemas;
             $log.info("[" + (end - start) + "] msec - to get " + angular.fromJson(allSchemas).length + " schemas from topic _schemas"); //  + JSON.stringify(allSchemas)
             schemas = allSchemas
             return schemas;
          }, function (reason) {
            $log.error('Failed: ' + reason);
          }, function (update) {
            $log.info('Got notification: ' + update);
          });
    }

  }

});