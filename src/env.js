
// Replace with the URL where a Kafka REST service is listening
var KAFKA_REST = "https://kafka-rest-proxy.demo.landoop.com"; // http://localhost:8082

// UI to your `schema-registry-ui` app
var UI_SCHEMA_REGISTRY = "http://schema-registry-ui.landoop.com"; // Leave empty to disable integration

var KAFKA_REST_ENV = {

  // Sets the defaul maximum amount of bytes to fetch from each topic
  MAX_BYTES: "?max_bytes=50000",

  // Pre-configure the Data Type on particular well-known topics
  JSON_TOPICS: ["_schemas"],

  BINARY_TOPICS: ["connect-configs", "connect-offsets", "connect-status", "_confluent-controlcenter", "__confluent.support.metr"],

  // If a topic starts with this particular prefix - it's a control topic
  CONTROL_TOPICS: ["_confluent-controlcenter", "__confluent", "__consumer_offsets", "_confluent-monitoring"],

// # Get info about one topic
// $ curl http://kafka-rest-proxy.demo.landoop.com/topics/__consumer_offsets
// {"name":"connect-test","configs":{},"partitions":[{"partition":0,"leader":0,"replicas":[{"broker":0,"leader":true,"in_sync":true}]},{"partition":1,"leader":0,"replicas":[{"broker":1,"leader":true,"in_sync":true}]}]}
//
// # Get info about a topic's partitions
// $ curl "http://localhost:8082/topics/test/partitions
//   [{"partition":0,"leader":0,"replicas":[{"broker":0,"leader":true,"in_sync":true}]},{"partition":1,"leader":0,"replicas":[{"broker":1,"leader":true,"in_sync":true}]}]

  topics: [{
    "name": "connect-configs",
    "config": {},
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "0": [0]
    }
  }, {
    "name": "_schemas",
    "config": {
      "cleanup.policy": "compact"
    },
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "0": [0]
    }
  }, {
    "name": "coyote_test_json",
    "config": {},
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "0": [0]
    }
  }, {
    "name": "coyote_test_binary",
    "config": {},
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "0": [0]
    }
  }, {
    "name": "connect-offsets",
    "config": {},
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "0": [0]
    }
  }, {
    "name": "demo-sql-inject",
    "config": {},
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "0": [0]
    }
  }, {
    "name": "demo-evolution",
    "config": {},
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "0": [0]
    }
  }, {
    "name": "demo-person-1pc",
    "config": {},
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "0": [0]
    }
  }, {
    "name": "demo-person",
    "config": {},
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "0": [0]
    }
  }, {
    "name": "demo-reserved",
    "config": {},
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "0": [0]
    }
  }, {
    "name": "coyote_test_avro",
    "config": {},
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "0": [0]
    }
  }, {
    "name": "__consumer_offsets",
    "config": {
      "segment.bytes": "104857600",
      "compression.type": "uncompressed",
      "cleanup.policy": "compact"
    },
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "45": [0],
      "34": [0],
      "12": [0],
      "8": [0],
      "19": [0],
      "23": [0],
      "4": [0],
      "40": [0],
      "15": [0],
      "11": [0],
      "9": [0],
      "44": [0],
      "33": [0],
      "22": [0],
      "26": [0],
      "37": [0],
      "13": [0],
      "46": [0],
      "24": [0],
      "35": [0],
      "16": [0],
      "5": [0],
      "10": [0],
      "48": [0],
      "21": [0],
      "43": [0],
      "32": [0],
      "49": [0],
      "6": [0],
      "36": [0],
      "1": [0],
      "39": [0],
      "17": [0],
      "25": [0],
      "14": [0],
      "47": [0],
      "31": [0],
      "42": [0],
      "0": [0],
      "20": [0],
      "27": [0],
      "2": [0],
      "38": [0],
      "18": [0],
      "30": [0],
      "7": [0],
      "29": [0],
      "41": [0],
      "3": [0],
      "28": [0]
    }
  }, {
    "name": "__confluent.support.metrics",
    "config": {
      "retention.ms": "31536000000"
    },
    "partitionsVersion": "1",
    "configVersion": "1",
    "partitions": {
      "0": [0]
    }
  }]
};

var KAFKA_DEFAULTS =
  [{
    "property": "cleanup.policy",
    "default": "delete",
    "serverDefaultProperties": "log.cleanup.policy",
    "description": "A string that is either \"delete\" or \"compact\". This string designates the retention policy to use on old log segments. The default policy (\"delete\") will discard old segments when their retention time or size limit has been reached. The \"compact\" setting will enable log compaction on the topic."
  }, {
    "property": "delete.retention.ms",
    "default": "86400000",
    "serverDefaultProperties": "log.cleaner.delete.retention.ms",
    "description": "The amount of time to retain delete tombstone markers for log compacted topics. This setting also gives a bound on the time in which a consumer must complete a read if they begin from offset 0 to ensure that they get a valid snapshot of the final stage (otherwise delete tombstones may be collected before they complete their scan). Default is 24 hours"
  }, {
    "property": "flush.messages",
    "default": "None",
    "serverDefaultProperties": "log.flush.interval.messages",
    "description": "This setting allows specifying an interval at which we will force an fsync of data written to the log. For example if this was set to 1 we would fsync after every message; if it were 5 we would fsync after every five messages. In general we recommend you not set this and use replication for durability and allow the operating system's background flush capabilities as it is more efficient. This setting can be overridden on a per-topic basis (see the per-topic configuration section)."
  }, {
    "property": "flush.ms",
    "default": "None",
    "serverDefaultProperties": "log.flush.interval.ms",
    "description": "This setting allows specifying a time interval at which we will force an fsync of data written to the log. For example if this was set to 1000 we would fsync after 1000 ms had passed. In general we recommend you not set this and use replication for durability and allow the operating system's background flush capabilities as it is more efficient."
  }, {
    "property": "index.interval.bytes",
    "default": "4096",
    "serverDefaultProperties": "log.index.interval.bytes",
    "description": "This setting controls how frequently Kafka adds an index entry to it's offset index. The default setting ensures that we index a message roughly every 4096 bytes. More indexing allows reads to jump closer to the exact position in the log but makes the index larger. You probably don't need to change this."
  }, {
    "property": "max.message.bytes",
    "default": "1000000",
    "serverDefaultProperties": "message.max.bytes",
    "description": "This is largest message size Kafka will allow to be appended to this topic. Note that if you increase this size you must also increase your consumer's fetch size so they can fetch messages this large."
  }, {
    "property": "min.cleanable.dirty.ratio",
    "default": "0.5",
    "serverDefaultProperties": "log.cleaner.min.cleanable.ratio",
    "description": "This configuration controls how frequently the log compactor will attempt to clean the log (assuming log compaction is enabled). By default we will avoid cleaning a log where more than 50% of the log has been compacted. This ratio bounds the maximum space wasted in the log by duplicates (at 50% at most 50% of the log could be duplicates). A higher ratio will mean fewer, more efficient cleanings but will mean more wasted space in the log."
  }, {
    "property": "min.insync.replicas",
    "default": "1",
    "serverDefaultProperties": "min.insync.replicas",
    "description": "When a producer sets acks to \"all\", min.insync.replicas specifies the minimum number of replicas that must acknowledge a write for the write to be considered successful. If this minimum cannot be met, then the producer will raise an exception (either NotEnoughReplicas or NotEnoughReplicasAfterAppend). When used together, min.insync.replicas and acks allow you to enforce greater durability guarantees. A typical scenario would be to create a topic with a replication factor of 3, set min.insync.replicas to 2, and produce with acks of \"all\". This will ensure that the producer raises an exception if a majority of replicas do not receive a write."
  }, {
    "property": "retention.bytes",
    "default": "None",
    "serverDefaultProperties": "log.retention.bytes",
    "description": "This configuration controls the maximum size a log can grow to before we will discard old log segments to free up space if we are using the \"delete\" retention policy. By default there is no size limit only a time limit."
  }, {
    "property": "retention.ms",
    "default": "7 days",
    "serverDefaultProperties": "log.retention.minutes",
    "description": "This configuration controls the maximum time we will retain a log before we will discard old log segments to free up space if we are using the \"delete\" retention policy. This represents an SLA on how soon consumers must read their data."
  }, {
    "property": "segment.bytes",
    "default": "1 GB",
    "serverDefaultProperties": "log.segment.bytes",
    "description": "This configuration controls the segment file size for the log. Retention and cleaning is always done a file at a time so a larger segment size means fewer files but less granular control over retention."
  }, {
    "property": "segment.index.bytes",
    "default": "10 MB",
    "serverDefaultProperties": "log.index.size.max.bytes",
    "description": "This configuration controls the size of the index that maps offsets to file positions. We preallocate this index file and shrink it only after log rolls. You generally should not need to change this setting."
  }, {
    "property": "segment.ms",
    "default": "7 days",
    "serverDefaultProperties": "log.roll.hours",
    "description": "This configuration controls the period of time after which Kafka will force the log to roll even if the segment file isn't full to ensure that retention can delete or compact old data."
  }, {
    "property": "segment.jitter.ms",
    "default": "0",
    "serverDefaultProperties": "log.roll.jitter.{ms,hours}",
    "description": "The maximum jitter to subtract from logRollTimeMillis."
  }];
