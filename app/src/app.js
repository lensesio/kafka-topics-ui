'use strict';

var kafkaZooUIApp = angular.module('kafkaZooUIApp', [
  'ui.ace',
  'angularSpinner',
  'angularUtils.directives.dirPagination',
  'ngRoute',
  'ngMaterial',
  'ngAnimate',
  'ngAria',
  'base64'
])

kafkaZooUIApp.controller('MenuCtrl', function ($scope) {
   $scope.apps = [];
   var thisApp = "Kafka Topics"
   angular.forEach(ENV.APPS, function (app) {
      if (app.enabled && !(app.name == thisApp)) {
         $scope.apps.push(app);
      }
   });

   $scope.disableAppsMenu = true;
   if ($scope.apps.length > 0) {
      $scope.disableAppsMenu = false;
   }
  });


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

// $httpProvider lives only in .config
kafkaZooUIApp.config(function ($routeProvider, $httpProvider) {
  $httpProvider.defaults.useXDomain = true;
  delete $httpProvider.defaults.headers.common['X-Requested-With'];

  $routeProvider
    .when('/', {
      templateUrl: 'src/home/home.html'
      // controller: 'MainCtrl'
    })
    .when('/create-topic', {
      templateUrl: 'src/kafka-topics-new/kafka-topics-new.html',
      controller: 'HeaderCtrl'
    })
    .when('/topic/:topicName', {
      templateUrl: 'src/kafka-topics-detail/kafka-topics-detail.html',
      controller: 'ViewTopicCtrl'
    }).otherwise({
    redirectTo: '/'
  });
  // $locationProvider.html5Mode(true);

});

kafkaZooUIApp.controller('AboutCtrl', function ($scope, $routeParams, $mdToast, $log) {
  $log.debug("AboutCtrl - initializing");
  $mdToast.hide();
  //kafkaZooFactory.visibleCreateSubjectButton(true);
});

kafkaZooUIApp.controller('MainCtrl', function ($scope, $routeParams, $mdToast, $log, kafkaZooFactory) {
    $log.debug("MainCtrl - initializing");
    $mdToast.hide();

    var promise = kafkaZooFactory.getTopicList(false);
    promise.then(function (allTopics) {
      $log.debug('Success fetching allTopics ' + JSON.stringify(allTopics));
      //$scope.subjectObject = selectedSubject;
      //$scope.aceString = angular.toJson(selectedSubject.Schema, true);
      //$scope.multipleVersionsOn = $scope.subjectObject.otherVersions.length > 0;
      $scope.topics = allTopics;
    }, function (reason) {
      $log.error('Failed: ' + reason);
    }, function (update) {
      $log.info('Got notification: ' + update);
    });

    $scope.countPartitionsForTopic = function (topicObj) {
      //$log.debug('Counting partitions for topic : ' + JSON.stringify(topicObj));
      if ((topicObj == undefined) || (topicObj.partitions == undefined)) {
        return 0;
      } else {
        return Object.keys(topicObj.partitions).length;
      }
    };

    // $scope.topics = ENV.topics;
    //schemaRegistryFactory.visibleCreateSubjectButton(true);
  }
);

kafkaZooUIApp.controller('HeaderCtrl', function ($scope, $rootScope, $http, $log) {
  $log.debug("HeaderCtrl initiating");
  $scope.schemaRegistryURL = ENV.SCHEMA_REGISTRY;
  $scope.config = {};
  $scope.connectionFailure = false;
  $scope.noSubjectName = true;
  $rootScope.showCreateSubjectButton = false;

});

kafkaZooUIApp.controller('ViewTopicCtrl', function ($scope, $routeParams, $log, $mdToast, $http, $base64, kafkaZooFactory) {

    $scope.topicName = $routeParams.topicName;
    $log.info("ViewTopicCtrl - initializing for topic : " + $scope.topicName);
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
      $log.debug(postCreateConsumer);

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

  }
); //end of controller