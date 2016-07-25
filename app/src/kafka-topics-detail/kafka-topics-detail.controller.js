kafkaTopicsUIApp.controller('ViewTopicCtrl', function ($scope, $rootScope, $filter, $routeParams, $log, $mdToast, $http, $base64, kafkaZooFactory) {

    $scope.topicName = $routeParams.topicName;
    $log.info("ViewTopicCtrl - initializing for topic : " + $scope.topicName);

    //tODO
    $scope.myTopic= $filter('filter')($rootScope.topicsCache, {name: $scope.topicName}, true);



    ///////////////////////////////////////////
    $mdToast.hide();
    $scope.kafkaDefaults = KAFKA_DEFAULTS; //TODO
    $scope.showSpinner = false;
    $scope.topicsOn = true;
    $scope.zookeeperInfo = "zookeeper.landoop.com.info.goes.here";
    $scope.brokers = ENV.BROKERS;

    $scope.isAvro = false;
    $scope.isJson = false;
    $scope.isBinary = false;

    $scope.changeView = function () {
      $scope.topicsOn = !$scope.topicsOn;
    };

    function bytesToSize2(bytes) {
      var sizes = ['n/a', 'bytes', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];
      var i = +Math.floor(Math.log(bytes) / Math.log(1024));
      return (bytes / Math.pow(1024, i)).toFixed(i ? 1 : 0) + ' ' + sizes[isNaN(bytes) ? 0 : i + 1];
    }

    // KAFKA-REST CONSUME
    $scope.startFetchingData = function (messagetype, topicName, consumer) {

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
      $log.debug(getData);
      var curlGetAvroData = 'curl -vs --stderr - -X GET -H "Accept: ' + acceptMessageType + '" ' +
        ENV.KAFKA_REST + '/consumers/' + consumer + '/instances/' + instance + '/topics/' + topicName;
      $log.info(curlGetAvroData);

      // [{"key":null,"value":{"name":"testUser"},"partition":0,"offset":0}]
      // EXECUTE-2
      $http(getData)
        .then(
          function successCallback(response) {
            $log.info("Success in consuming " + messagetype + " data " + bytesToSize2(JSON.stringify(response).length));
            if (messagetype == "binary") {
              var data = response.data;
              var data2 = angular.forEach(data, function (d) {
                d.key = $base64.decode(d.key);
                d.value = $base64.decode(d.value);
              });
              $scope.aceString = angular.toJson(data2, true);
            } else {
              $scope.aceString = angular.toJson(response.data, true);
            }
          },
          function errorCallback(response) {
            $log.error("Error in consuming " + messagetype + " data : " + JSON.stringify(response));
            if (response.data.error_code == 50002) {
              kafkaZooFactory.showSimpleToast("This is not JSon");
            } else {
              kafkaZooFactory.showSimpleToast("This is not Avro")
            }
          });

    };

    // 1. Create a consumer for Avro data, starting at the beginning of the topic's log.
    // 2. Then consume some data from a topic, which is decoded, translated to JSON, and included in the response.
    // The schema used for deserialization is fetched automatically from the schema registry.
    // 3. Finally, clean up.
    // [ avro | json | binary ]
    $scope.consumeKafkaRest = function (messagetype, topicName) {

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

      var curlCreateConsumer = 'curl -X POST -H "Content-Type: ' + messageContentType + '" ' +
        "--data '" + data + "' " + ENV.KAFKA_REST + '/consumers/' + consumer + '-' + messagetype;
      $log.info(curlCreateConsumer);

      // EXECUTE-1
      $http(postCreateConsumer)
        .then(
          function successCallback(response) {
            // this callback will be called asynchronously when the response is available
            $log.info("Success in creating avro consumer " + JSON.stringify(response));
            $scope.startFetchingData(messagetype, topicName, consumer + "-" + messagetype);
          },
          function errorCallback(response, statusText) {
            if (response.status == 409) {
              $log.info("409 detected! " + response.data.message);
              kafkaZooFactory.showSimpleToast(response.data.message);
              $scope.startFetchingData(messagetype, topicName, consumer + "-" + messagetype);
            }
          }
        );


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
    };

    // TOPICS
    $scope.selectedTopic;
    $scope.selectTopic = function (topicObj) {
      $scope.selectedTopic = topicObj
    };

    $scope.getLeader = function (partitions) {
      if (partitions.length > 0) return partitions[0];
    };

    $scope.getTailPartitions = function (partitions) {
      return partitions.slice(1);
    };

    $scope.getKafkaDefaultValue = function (key) {
      var defaultValue;
      angular.forEach(KAFKA_DEFAULTS, function (item) {
        if (item.property == key) {
          defaultValue = item.default;
        }
      });
      return defaultValue;
    };

    $scope.getKafkaDefaultDescription = function (key) {
      var defaultValue;
      angular.forEach(KAFKA_DEFAULTS, function (item) {
        if (item.property == key) {
          defaultValue = item.description;
        }
      });
      return defaultValue;
    };

    // BROKERS
    $scope.selectedBroker;
    $scope.selectBroker = function (brokerObj) {
      $scope.selectedBroker = brokerObj
    }

  });