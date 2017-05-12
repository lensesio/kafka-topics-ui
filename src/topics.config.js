var KNOWN_TOPICS = {
  JSON_TOPICS: ["_schemas"],
  BINARY_TOPICS: ["connect-configs",
                  "connect-offsets",
                  "__consumer_offsets",
                  "_confluent-monitoring",
                  "_confluent-controlcenter",
                  "connect-statuses",
                  "__confluent.support.metr"],
  // If a topic starts with this particular prefix - it's a system topic
  CONTROL_TOPICS: ["_confluent-controlcenter", "_confluent-command", "_confluent-metrics", "connect-configs", "connect-offsets", "__confluent", "__consumer_offsets", "_confluent-monitoring", "connect-status", "_schemas"]
  };

//var TOPIC_CONFIG = {
//  KAFKA_TOPIC_DELETE_COMMAND : "kafka-topics --zookeeper zookeeper-host:2181/confluent --delete --topic",
//  // Pre-configure the Data Type on particular well-known topics
//  JSON_TOPICS: ["_schemas"],
//  BINARY_TOPICS: ["connect-configs", "connect-offsets", "__consumer_offsets", "_confluent-monitoring", "_confluent-controlcenter", "__confluent.support.metr"],
//  // If a topic starts with this particular prefix - it's a control topic
//  CONTROL_TOPICS: ["_confluent-controlcenter", "_confluent-command", "_confluent-metrics", "connect-configs", "connect-offsets", "__confluent", "__consumer_offsets", "_confluent-monitoring", "connect-status", "_schemas"]
//  };
