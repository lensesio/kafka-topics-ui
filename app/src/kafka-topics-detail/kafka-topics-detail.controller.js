kafkaTopicsUIApp.controller('ViewTopicCtrl', function ($scope, $rootScope, $filter, $routeParams, $log, $mdToast, $http, $base64, kafkaZooFactory) {

    $scope.topicName = $routeParams.topicName;
    $log.info("ViewTopicCtrl - initializing for topic : " + $scope.topicName);

    var topicsMap = {};
    topicsMap["_schemas"]="json";
    topicsMap["connect-configs"]="avro";
    topicsMap["connect-offsets"]="avro";
    topicsMap["connect-status"]="avro";

    $log.info(topicsMap["_schemas"]);

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
            $log.info("Success in creating " + messagetype + " consumer " + JSON.stringify(response));
            var textDataPromise = kafkaZooFactory.startFetchingData(messagetype, topicName, consumer + "-" + messagetype);
            textDataPromise.then(function (data) {
              $log.info("Peiler got -> " + data);
              $scope.aceString = data;
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