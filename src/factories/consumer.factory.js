angularAPP.factory('consumerFactory', function ($rootScope, $http, $log, $q, $filter, $cookies, env, HttpFactory) {

  var URL_PREFIX = env.KAFKA_REST().trim();
  var RECORDS_TIMEOUT = env.RECORD_POLL_TIMEOUT(); //TODO put to env for the user to decide
  var RECORDS_MAX_BYTES = env.MAX_BYTES().trim();
  var CONTENT_TYPE_JSON = 'application/vnd.kafka.v2+json';
  var CONSUMER_NAME_PREFIX = 'kafka-topics-ui-';
  var PRINT_DEBUG_CURLS = false;

  /**
   * Creates consumer + group with unique uuid and type in name.
   **/
  function createConsumer(format, topicName, uuid) {
    $log.debug(topicName, "CREATING CONSUMER: ", getConsumer(format, uuid), uuid);
    var url = URL_PREFIX + '/consumers/' + getConsumer(format, uuid).group;
    var data = '{"name": "' + getConsumer(format).instance + '", "format": "' + format + '", "auto.offset.reset": "earliest", "auto.commit.enable": "false"}';
    return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', true, PRINT_DEBUG_CURLS);
  }

  /**
   * Waits for the pre-requisite requests to be done and then
   * starts polling records (/records).
   * When gets the records, deletes the consumer
   **/
  function getDataFromBeginning(consumer, format, topicName) {
    return $q.all([seekToBeginningOrEndForAllPartitions('beginning', consumer, topicName)]).then(function (res1) {
      $log.debug(topicName, '4) SEEK TO BEGGINING FOR ALL PARTITIONS DONE');
      $log.debug(topicName, "5) START POLLING WITH CONSUMER:", consumer);
    }).then(function (res2) {
      return getRecords(consumer, format).then(function (r) {
        if (r.data.length !== 0) saveTopicTypeToCookie(topicName, format);
        $log.debug(topicName, '6) DONE: GOT RECORDS', r.data.length);
        $log.debug(topicName, '7) SAVING TYPE TO COOKIE', format);
        deleteConsumer(consumer, topicName);
        return r;
      }, function (er) {
        $log.error("CANNOT GET RECORDS WITH FORMAT", format);
        deleteConsumer(consumer, topicName);
        return -1;
      });
    });
  }

  function getDataForPartition(topicName, consumer, format, partition, offset, position) {
    return postConsumerAssignments(consumer, topicName, partition).then(function (responseAssign) {
      return postConsumerPositions(consumer, topicName, partition[0], offset, position).then(function (responseOffset) {
        $log.debug(topicName, '4) SEEK TO OFFSET FOR PARTITION DONE');
        $log.debug(topicName, "5) START POLLING WITH CONSUMER:", consumer);
        return getRecords(consumer, format).then(function (r) {
          $log.debug(topicName, '6) DONE: GOT RECORDS', r.data.length);
          $log.debug(topicName, '7) SAVING TYPE TO COOKIE', format);
          deleteConsumer(consumer, topicName);
          return r;
        }, function (er) {
          $log.error("CANNOT GET RECORDS WITH FORMAT", format);
          deleteConsumer(consumer, topicName);
          return -1;
        });
      });
    });
  }

  /**
   * Does all the required requests before polling
   * 1) Gets the paritions for topic (/partitions)
   * 2) Assigns ALL the partitions to consumer (/assignments)
   * 3) Moves all the partitions to beginning (/positions/beginning)
   * TODO pass the partitions because
   * TODO         a) we have them so no need for requests b)
   * TODO         a) will make it generic to be used for 1 partition as well
   * TODO         c) rename to seekAll(topicName, consumer, beginningOrEnd) and/or
   * TODO                      seekForPartition(topicName, consumer, beginningOrEnd, partition, offset)
   **/
  function seekToBeginningOrEndForAllPartitions(beginningOrEnd, consumer, topicName) {
    $log.debug(topicName, "POLL STEPS START");
    return getPartitions(topicName).then(function (partitions) {
      $log.debug(topicName, '1) DONE: GOT ALL PARTITIONS', partitions);
      return postConsumerAssignments(consumer, topicName, partitions.data).then(function (r) {
        $log.debug(topicName, '3) DONE: ASSIGNED PARTITIONS TO CONSUMER');
        var url = URL_PREFIX + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/positions/' + beginningOrEnd;
        var data = preparePartitionData(topicName, partitions.data);
        return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', false, PRINT_DEBUG_CURLS);
      })
    });
  }

  /* PRIMITIVE REQUESTS RETURN PROMISES */

  function postConsumerAssignments(consumer, topicName, partitions) {
//    return deleteConsumerSubscriptions(consumer).then(function(responseDelete){
    var data = preparePartitionData(topicName, partitions);
    $log.debug(topicName, "2) ACTUAL PARTITIONS TO ASSIGN", data);
    var url = URL_PREFIX + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/assignments';
    return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', false, PRINT_DEBUG_CURLS);
//    })
  }

  function getConsumerAssignments() {
    var url_tmp = env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/assignments';
    HttpFactory.req('GET', url_tmp, '', '', '', false, false).then(function (res) {
      $log.debug(topicName, "EXISTING ASSIGNMENTS", res.data);
    })
  }

  function getPartitions(topicName) {
    var url = URL_PREFIX + '/topics/' + topicName + '/partitions';
    return HttpFactory.req('GET', url, '', '', 'application/vnd.kafka.v2+json, application/vnd.kafka+json, application/json', false, PRINT_DEBUG_CURLS);
  }

  function getRecords(consumer, format) {
    var url = URL_PREFIX + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/records?timeout=' + RECORDS_TIMEOUT + '&max_bytes=' + RECORDS_MAX_BYTES;
    var ACCEPT_HEADER = 'application/vnd.kafka.' + format + '.v2+json';
    return HttpFactory.req('GET', url, '', CONTENT_TYPE_JSON, ACCEPT_HEADER, false, PRINT_DEBUG_CURLS);
  }

  function deleteConsumer(consumer, topicName) {
    HttpFactory.req('DELETE', URL_PREFIX + '/consumers/' + consumer.group + '/instances/' + consumer.instance, '', CONTENT_TYPE_JSON, '', false, false)
      .then(function (res) {
        $log.debug(topicName, "8) CONSUMER DELETED", consumer);
        $cookies.remove('uuid')
      })
  }

  function postConsumerPositions(consumer, topicName, partition, offset, position) {

    switch (position) {
      case 'beginning':
        var data = {'partitions': [{'topic': topicName, 'partition': partition.partition}]};
        $log.debug(topicName, "3) SEEK PARTITION TO BEGINNING", data);
        var url = env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/positions/beginning';
        return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', true, PRINT_DEBUG_CURLS);
        break;
      case 'end':
        var data = {'partitions': [{'topic': topicName, 'partition': partition.partition}]};
        $log.debug(topicName, "3) SEEK PARTITION TO END", data);
        var url = env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/positions/end';
        return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', true, PRINT_DEBUG_CURLS);
        break;
      case 'offset':
        var data = {'offsets': [{'topic': topicName, 'partition': partition.partition, 'offset': offset}]};
        $log.debug(topicName, "3) SEEK TO OFFSETS", data);
        var url = env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/positions';
        return HttpFactory.req('POST', url, data, CONTENT_TYPE_JSON, '', true, PRINT_DEBUG_CURLS);
        break;
      default:
        $log.debug("EEEERROR", position)
    }
  }

//TODO not in used.
  function deleteConsumerSubscriptions(consumer) {
    var deferred = $q.defer();

    var getConsumerOffsets = {
      method: 'DELETE',
      url: env.KAFKA_REST().trim() + '/consumers/' + consumer.group + '/instances/' + consumer.instance + '/subscription',
      headers: {'Accept': 'application/vnd.kafka.v2+json, application/vnd.kafka+json, application/json'}
    };

    $http(getConsumerOffsets).then(
      function success(response) {
        deferred.resolve(response);
      },
      function failure(response) {

        deferred.reject(response);
      });

    return deferred.promise
  }

  //UTILITIES / STATICS

  function getConsumer(format, uuid) {
    return {group: 'kafka_topics_ui_' + format + '_' + uuid, instance: CONSUMER_NAME_PREFIX + format};
  }

  function preparePartitionData(topicName, partitions) {
    var data = {'partitions': []};
    angular.forEach(partitions, function (partition) {
      data.partitions.push({'topic': topicName, 'partition': partition.partition})
    });
    return data;
  }

  function consumerUUID() {
    var a = $filter('date')(Date.now(), "yyyy-MM-dd-hh-mm-ss");
    $cookies.put('uuid', $filter('date')(Date.now(), "yyyy-MM-dd-hh-mm-ss")); //TODO milis, do we need the cookie ?
    return a;
  }

  function saveTopicTypeToCookie(topicName, format) {
    var expireDate = new Date();
    expireDate.setDate(expireDate.getDate() + 1);
    $cookies.put(topicName, format, {'expires': expireDate});
  }

  function hasCookieType(topicName) {
    var a = $cookies.getAll();
    return a[topicName] ? true : false;
  }

  function isKnownBinaryTopic(topicName) {
    var a = false;
    angular.forEach(KNOWN_TOPICS.BINARY_TOPICS, function (t) {  //todo filter
      if (t == topicName) a = true;
    });
    return a;
  }

  function isKnownJSONTopic(topicName) {
    var a = false;
    angular.forEach(KNOWN_TOPICS.JSON_TOPICS, function (t) {  //todo filter
      if (t == topicName) {
        a = true;
      }
    });
    return a;
  }

  /**
   * If topic is not defined, or hasn't been consumed before, then will try detection start with Avro
   **/
  function getConsumerType(topicName) {
    if (isKnownBinaryTopic(topicName)) {
      $log.debug(topicName, "DETECTING TYPE.. IT'S A KNOWN [ BINARY ] TOPIC [topics.config.js]");
      return 'binary';
    }
    if (isKnownJSONTopic(topicName)) {
      $log.debug(topicName, "DETECTING TYPE.. IT'S A KNOWN [ JSON ] TOPIC [topics.config.js]");
      return 'json';
    } else if (hasCookieType(topicName)) {
      var a = $cookies.getAll();
      $log.debug(topicName, "DETECTING TYPE.. HAVE CONSUMED THIS TOPIC BEFORE, IT'S IN COOKIE. TYPE IS [" + a[topicName] + "]");
      return a[topicName];
    } else {
      $log.debug(topicName, "DETECTING TYPE.. DON'T KNOW THE TYPE I WILL TRY WITH [ AVRO ] FIRST");
      return 'avro';
    }
  }

  function getConsumerTypeRetry(previousFormatTried, topicName) {
    switch (previousFormatTried) {
      case 'avro':
        $log.debug(topicName, "DETECTING TYPE.. FAILED WITH AVRO, WILL TRY [ JSON ]");
        return 'json';
        break;
      case 'json':
        $log.debug(topicName, "DETECTING TYPE.. FAILED WITH JSON, WILL TRY [ BINARY ]");
        return 'binary';
        break;
      default:
        $log.debug(topicName, "DETECTING TYPE.. FAILED WITH AVRO & JSON, WILL TRY [ BINARY ]");
        return 'binary';
    }
  }

  //PUBLIC METHODS // TODO cleanup

  return {
    createConsumer: function (format, topicName, uuid) {
      return createConsumer(format, topicName, uuid); //TODO why plural?
    },
    getConsumer: function (format, uuid) {
      return getConsumer(format, uuid);
    },
    getConsumerType: function (topicName) {
      return getConsumerType(topicName);
    },
    getConsumerTypeRetry: function (previousFormatTried, topicName) {
      return getConsumerTypeRetry(previousFormatTried, topicName);
    },
    getDataFromBeginning: function (consumer, format, topicName) {
      return getDataFromBeginning(consumer, format, topicName);
    },
    seekToBeginningOrEndForAllPartitions: function (beginningOrEnd, consumer, topicName, partition) {
      return seekToBeginningOrEndForAllPartitions(beginningOrEnd, consumer, topicName, partition);
    },
    postConsumerPositions: function (consumer, topicName, partition, offset) {
      return postConsumerPositions(consumer, topicName, partition, offset);
    },
    postConsumerAssignments: function (consumer, topicName, partitions) {
      return postConsumerAssignments(consumer, topicName, partitions);
    },
    getRecords: function (consumer, format) {
      return getRecords(consumer, format);
    },
    deleteConsumerSubscriptions: function (consumer) {
      return deleteConsumerSubscriptions(consumer);
    },
    getConsumerOffsets: function (consumer, topicName) {
      return getConsumerOffsets(consumer, topicName);
    },
    getPartitions: function (topicName) {
      return getPartitions(topicName);
    },
    genUUID: function () {
      return consumerUUID();
    },
    getDataForPartition: function (topicName, consumer, format, partition, offset, position) {
      return getDataForPartition(topicName, consumer, format, partition, offset, position);
    }
  }
});
