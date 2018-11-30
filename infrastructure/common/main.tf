variable "product"                 { default = "eil-kafka-topics-ui" }
variable "heroku_region"           { default = "eu" }
variable "heroku_email"            { description = "set as env variable after logging into heroku" }
variable "heroku_api_key"          { description = "set as env variable after logging into heroku" }
variable "heroku_organisation"     { default = "eurostar" }

terraform {
  required_version = ">= 0.11.2"
  backend "s3" {
    bucket = "eil-tf-states"
    key    = "kafka-topics-ui/aws/common/terraform.tfstate"
    region = "eu-west-1"
  }
}

provider "heroku" {
  email = "${var.heroku_email}"
  api_key = "${var.heroku_api_key}"
}

resource "heroku_pipeline" "main" {
  name = "${var.product}"
}#

output "heroku_pipeline_name"     { value = "${heroku_pipeline.main.name}" }
output "heroku_pipeline_id"     { value = "${heroku_pipeline.main.id}" }