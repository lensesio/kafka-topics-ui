var TOPIC_CONFIG = {
  // Pre-configure the Data Type on particular well-known topics
  JSON_TOPICS: ["_schemas"],
  BINARY_TOPICS: ["connect-configs", "connect-offsets", "__consumer_offsets", "_confluent-monitoring", "_confluent-controlcenter", "__confluent.support.metr"],
  // If a topic starts with this particular prefix - it's a control topic
  CONTROL_TOPICS: ["_confluent-controlcenter", "connect-configs", "connect-offsets", "__confluent", "__consumer_offsets", "_confluent-monitoring", "connect-status", "_schemas"]
  };